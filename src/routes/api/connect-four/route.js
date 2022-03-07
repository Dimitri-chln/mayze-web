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
		const buffers = [];

		for await (const chunk of request) {
			buffers.push(chunk);
		}

		const data = JSON.parse(Buffer.concat(buffers).toString());

		if (!Util.connectFourGames.has(token))
			Util.connectFourGames.set(token, {
				token: token,
				child: childProcess.spawn('connect-4/c4solver', ['-w', '-a']),
			});

		const connectFourGame = Util.connectFourGames.get(token);
		const positions = [];

		connectFourGame.child.stdin.write(data.played.toString());

		connectFourGame.child.stdout.on('data', (data) => {
			const items = data.split(' ');
			console.log(items);

			positions.push({
				index: items[0],
				score: items[1],
			});

			if (positions.length === 7) {
				connectFourGame.child.stdout.removeListener('data');
				console.log(positions);

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(positions));
				response.end();
			}
		});
	}
}

module.exports = Route;
