const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../../BaseRoute');
const Util = require('../../../../Util');
const Axios = require('axios').default;



class Route extends BaseRoute {
	static path = '/api/discord/user';
	static requireLogin = true;
	
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		const { 'rows': tokens } = await Util.database.query(`SELECT user_id, discord_token FROM web_clients WHERE token = '${token}'`);
		const { discord_token } = tokens[0];

		// Fetch requested user
		if (url.searchParams.has('user_id')) {
			const requestedUser = Util.guild.members.cache.get(url.searchParams.get('user_id'))?.user;
				
			if (requestedUser) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(
					requestedUser.toJSON()
				));
				response.end();
			
			} else {
				response.writeHead(401, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify({
					status: 404,
					message: 'Not Found'
				}));
				return response.end();
			}

		// Fetch requesting user
		} else {
			Axios.get('https://discord.com/api/users/@me', {
				headers: {
					Authorization: `Bearer ${discord_token}`
				}
			})
				.then(res => {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify(res.data));
					response.end();
				});
		}
	}
}



module.exports = Route;