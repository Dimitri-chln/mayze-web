const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const childProcess = require('child_process');

class Route extends BaseRoute {
	static path = '/api/connect-four';
	static methods = ['GET', 'POST'];
	static loginRequired = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		switch (request.method.toUpperCase()) {
			case 'GET': {
				const positions = url.searchParams.get('positions');

				if (!positions) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				const child = childProcess.execFile('connect-4/c4solver', ['-a', '-b', 'connect-4/7x6.book']);

				child.stdout.on('data', (data) => {
					const res = data.trim().split(' ');
					res.shift();

					const scores = res.map((s) => (parseInt(s) === -1000 ? null : parseInt(s)));

					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							positions: positions.split('').map((p) => parseInt(p)),
							scores: scores,
						}),
					);
					response.end();
				});

				child.stdin.end(positions);
				break;
			}

			case 'POST': {
				const user = await this.fetchUser(token);

				const result = url.searchParams.get('result');
				const difficulty = parseInt(url.searchParams.get('difficulty'));

				if (!result || !difficulty) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				const defaultData = Array.from(Array(21), (_, i) => 5 * i).reduce((data, key) => {
					data[key] = {
						played: 0,
						win: 0,
						defeat: 0,
						draw: 0,
					};

					return data;
				}, {});

				defaultData[difficulty].played = 1;
				defaultData[difficulty][result] = 1;

				await Util.database.query(
					`
					INSERT INTO connect_four VALUES ($1, $2)
					ON CONFLICT (user_id)
					DO UPDATE SET
						stats = jsonb_set(
							jsonb_set(connect_four.stats, '{${difficulty}, played}', ((connect_four.stats -> $3 -> 'played')::int + 1)::text::jsonb),
							'{${difficulty}, ${result}}',
							((connect_four.stats -> $3 -> $4)::int + 1)::text::jsonb
						)
					WHERE connect_four.user_id = EXCLUDED.user_id
					`,
					[user.id, defaultData, difficulty, result],
				);

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end();
				break;
			}
		}
	}
}

module.exports = Route;
