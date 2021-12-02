const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Axios = require("axios").default;
const Util = require('../../../Util');



const route = {
	name: 'calendar',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token 
	 */
	run: async (url, request, response, token) => {
		const mayzeToken = url.searchParams.get('token') || token;

		if (request.method.toUpperCase() !== 'GET' || !mayzeToken) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		const data = require('./calendar.json');
		data.splice(new Date().getDate() - 1);

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(data));
		response.end();
	}
};

module.exports = route;