const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');

class Route extends BaseRoute {
	static path = '/api/secret';
	static methods = ['POST'];
	static requireLogin = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const { rows: tokens } = await Util.database.query(
			'SELECT user_id FROM web_client WHERE token = $1',
			[token],
		);

		if (!tokens.length) throw new Error('Not Authenticated');

		const userID = tokens[0].user_id;
		const member = Util.guild.members.cache.get(userID);

		Util.discord.channels.cache
			.get('907603255402578003')
			.send(`${member.user} (${member.user.tag}) a trouvé le secret !`)
			.then(() => {
				response.writeHead(200);
				response.end();
			});
	}
}

module.exports = Route;
