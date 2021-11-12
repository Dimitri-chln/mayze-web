const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Axios = require("axios").default;
const Util = require('../../../../Util');



const route = {
	name: 'login',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token 
	 */
	run: async (url, request, response, token) => {
		const mayzeToken = url.searchParams.get('token') || token;

		if (request.method.toUpperCase() !== 'POST' || !mayzeToken || !url.searchParams.has('code')) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		const data = {
			client_id: '703161067982946334',
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'authorization_code',
			redirect_uri: `${process.env.URL}/callback`,
			code: url.searchParams.get('code'),
			scope: 'identify',
		};

		const res = await Axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(err => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving token');
		});

		const user = await Axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${res.data.access_token}` } }).catch(err => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving user');
		});

		await Util.database.query(`UPDATE web_clients SET discord_token = '${res.data.access_token}', discord_expires_at = '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}', discord_refresh_token = '${res.data.refresh_token}' WHERE user_id = '${user.data.id}'`);
		await Util.database.query(`INSERT INTO web_clients VALUES ('${mayzeToken}', '${user.data.id}', '${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}', '${res.data.access_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}', '${res.data.refresh_token}')`);
		
		response.writeHead(200);
		response.end();
	}
};

module.exports = route;