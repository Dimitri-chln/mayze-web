const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Fs = require('fs');
const Axios = require('axios').default;
const Util = require("../../Util");



const route = {
	name: 'profile',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token
	 */
	run: async (url, request, response, token) => {
		if (request.method.toUpperCase() !== 'GET') {
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('400 Bad Request');
		}

		Axios.get(`${process.env.URL}/api/discord/member?token=${token}`)
			.then(res => {
				const file = Fs.readFileSync('./routes/profile/index.html');
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.write(Util.completeHtmlFile(file));
				response.end();
			})
			.catch(err => {
				const file = Fs.readFileSync('./static/resources/html/unauthorized.html');
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.write(file);
				return response.end();
			});
	}
};

module.exports = route;