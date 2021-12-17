const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../../BaseRoute');



class Route extends BaseRoute {
	static path = '/api/discord/member';
	static requireLogin = true;
	static requireMember = true;
	
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		const member = await this.fetchMember(token);

		const JSONMember = {
			discord: {
				...member.discord.toJSON(),
				tag: member.discord.user.tag,
				roles: member.discord.roles.cache.toJSON()
			},
			wolvesville: member.wolvesville
		};
	
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(JSONMember));
		response.end();
	}
}



module.exports = Route;