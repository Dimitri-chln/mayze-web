const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../../BaseRoute');
const Util = require('../../../../Util');

class Route extends BaseRoute {
	static path = '/api/connect-four/stats';
	static loginRequired = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const user = await this.fetchUser(token);

		const {
			rows: [data],
		} = await Util.database.query('SELECT * FROM connect_four WHERE user_id = $1', [user.id]);

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(data?.stats ?? {}));
		response.end();
	}
}

module.exports = Route;
