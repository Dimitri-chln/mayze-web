const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const childProcess = require('child_process');

class Route extends BaseRoute {
	static path = '/api/connect-four';
	static requireLogin = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
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

		const child = childProcess.execFile('connect-4/c4solver', [
			'-a',
			'-b',
			'connect-4/7x6.book',
		]);

		child.stdout.on('data', (data) => {
			const res = data.trim().split(' ');
			res.shift();

			const scores = res
				.map((s) => parseInt(s))
				.map((s) => (s === -10_000 ? null : s));

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
	}
}

module.exports = Route;
