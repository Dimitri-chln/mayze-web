const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');

class Route extends BaseRoute {
	static path = '/api/translations';
	static loginRequired = true;
	static allowedUserIds = ['463358584583880704'];

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const { rows } = await Util.database.query('SELECT * FROM translation');

		const data = {};

		for (const row of rows) {
			const elements = row.name.split('.');
			let object = data;

			elements.forEach((e, i) => {
				if (!object[e]) object[e] = {};
				if (i < elements.length - 1) object = object[e];
			});

			object[elements[elements.length - 1]] = {
				default: row.default,
				translations: Object.entries(row).reduce((o, value) => {
					if (value[0] !== 'name' && value[0] !== 'default')
						o[value[0]] = value[1];
					return o;
				}, {}),
			};
		}

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(data));
		response.end();
	}
}

module.exports = Route;
