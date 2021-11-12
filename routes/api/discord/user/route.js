const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Axios = require("axios").default;
const Util = require('../../../../Util');



const route = {
	name: 'user',
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

		const { 'rows': tokens } = await Util.database.query(`SELECT user_id, discord_token FROM web_clients WHERE token = '${mayzeToken}'`);
		if (!tokens.length) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 401,
				message: 'Not Connected'
			}));
			return response.end();
		}

		const { user_id, discord_token } = tokens[0];

		if (url.searchParams.has('user_id')) {
			const guild = Util.discord.guilds.cache.get('689164798264606784');
        	const member = guild.members.cache.get(user_id);

        	if (member && member.roles.cache.has('689169027922526235')) {
				const requestedMember = guild.members.cache.get(url.searchParams.get('user_id'));
				
				if (requestedMember) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify(requestedMember.user));
					return response.end();
				} else {
					response.writeHead(401, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify({
						status: 404,
						message: 'Not Found'
					}));
					return response.end();
				}
			} else {
				response.writeHead(401, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify({
					status: 401,
					message: 'Not A Member'
				}));
				return response.end();
			}

		} else {
			Axios.get('https://discord.com/api/users/@me', {
				headers: {
					Authorization: `Bearer ${discord_token}`
				}
			})
				.then(res => {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify(res.data));
					return response.end();
				})
				.catch(err => {
					console.error(err);

					response.writeHead(500, { 'Content-Type': 'text/html' });
					response.write(JSON.stringify({
						status: 500,
						message: 'Internal Error'
					}));
					return response.end();
				});
		}
	}
};

module.exports = route;