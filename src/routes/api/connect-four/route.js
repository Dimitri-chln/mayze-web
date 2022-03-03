const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const childProcess = require('child_process');

class Route extends BaseRoute {
	static path = '/api/connect-four';
	static methods = ['POST'];
	static requireLogin = true;
	static requireMember = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		const buffers = [];

		for await (const chunk of request) {
			buffers.push(chunk);
		}

		const data = JSON.parse(Buffer.concat(buffers).toString());

		if (!Util.connectFourGames[token])
			Util.connectFourGames[token] = {
				token: token,
				child: childProcess.spawn('connect-4/c4solver.exe', ['-a', '-w']),
			};

		const connectFourGame = Util.connectFourGames[token];
		const positions = [];

		connectFourGame.child.stdout.on('data', (data) => {
			const items = data.split(' ');

			positions.push({
				index: items[0],
				score: items[1],
			});

			if (positions.length === 7) {
				connectFourGame.child.stdout.removeListener('data');

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(positions));
				response.end();
			}
		});

		connectFourGame.child.stdin.write(data.played.toString());
	}
}

module.exports = Route;
