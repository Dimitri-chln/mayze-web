const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../../BaseRoute');
const Util = require('../../../../Util');
const Axios = require('axios').default;

class Route extends BaseRoute {
	static path = '/api/discord/login';
	static methods = ['POST'];

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		if (!url.searchParams.has('code')) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(
				JSON.stringify({
					status: 400,
					message: 'Bad Request',
				}),
			);
			return response.end();
		}

		const data = {
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'authorization_code',
			redirect_uri: `${process.env.PROTOCOL}://${process.env.HOSTNAME}/callback`,
			code: url.searchParams.get('code'),
			scope: 'identify',
		};

		const res = await Axios.post(`https://discord.com/api/oauth2/token`, data, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}).catch((err) => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving token');
		});

		const user = await Axios.get('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${res.data.access_token}`,
			},
		}).catch((err) => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving user');
		});

		await Util.database.query(
			'UPDATE web_client SET discord_token = $1, discord_expires_at = $2, discord_refresh_token = $3 WHERE user_id = $4',
			[
				res.data.access_token,
				new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
				res.data.refresh_token,
				user.data.id,
			],
		);

		await Util.database.query('INSERT INTO web_client VALUES ($1, $2, $3, $4, $5, $6)', [
			token,
			user.data.id,
			new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			res.data.access_token,
			new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
			res.data.refresh_token,
		]);

		response.writeHead(200);
		response.end();
	}
}

module.exports = Route;
