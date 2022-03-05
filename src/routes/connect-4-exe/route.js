const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../BaseRoute');
const Util = require('../../Util');
const Fs = require('fs');
const Path = require('path');

class Route extends BaseRoute {
	static path = '/connect-4-exe';
	static requireLogin = true;
	static requireMember = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		await Util.zipDirectory(
			Path.join(__dirname, '..', '..', '..', 'connect-4'),
			Path.join(__dirname, '..', '..', 'public', 'static', 'connect-4.zip'),
		);

		const file = Fs.readFileSync(
			Path.join(__dirname, '..', '..', 'public', 'static', 'connect-4.zip'),
		);

		response.writeHead(200);
		response.write(file);
		response.end();
	}
}

module.exports = Route;
