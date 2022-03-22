const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');

class Route extends BaseRoute {
	static path = '/api/clan';
	static loginRequired = true;
	static memberRequired = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const data = {
			name: 'Mayze',
		};

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(data));
		response.end();
	}
}

module.exports = Route;
