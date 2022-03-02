const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const Fs = require('fs');
const BrainJS = require('brain.js');

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

		const member = await this.fetchMember(token);

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(bestColumn));
		response.end();
	}
}

module.exports = Route;
