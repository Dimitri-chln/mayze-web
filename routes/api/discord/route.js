const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('../../../../Util');



const route = {
	name: 'discord',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token 
	 */
	run: async (url, request, response, token) => {
        if (request.method.toUpperCase() !== 'GET') {
			response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
        }

		const d = {
			version: 1
		};

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(d));
        response.end();
    }
};

module.exports = route;