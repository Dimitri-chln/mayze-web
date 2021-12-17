const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');



class Route extends BaseRoute {
	static path = '/api/secret';
	
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') ?? token;

		const member = await this.fetchMember(token);

		Util.discord.channels.cache.get('907603255402578003').send(`${member.user} (${member.user.tag}) a trouvé le secret !`)
			.then(() => {
				response.writeHead(200);
				response.end();
			});
	}
}



module.exports = Route;