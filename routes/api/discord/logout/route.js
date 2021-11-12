const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('../../../../Util');



const route = {
	name: 'logout',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token 
	 */
	run: async (url, request, response, token) => {
		const mayzeToken = url.searchParams.get('token') || token;

		if (request.method.toUpperCase() !== 'POST' || !mayzeToken) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		await Util.database.query(`DELETE FROM web_clients WHERE token = '${mayzeToken}'`);

		response.writeHead(200);
		response.end();
	}
};

module.exports = route;