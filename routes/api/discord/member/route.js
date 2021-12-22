const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('../../../../Util');
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

		const { rows } = await Util.database.query(
			'SELECT * FROM levels WHERE user_id = $1',
			[ member.discord.user.id ]
		);

		const chatLevel = Util.getLevel(rows[0].chat_xp);
		const voiceLevel = Util.getLevel(rows[0].voice_xp);

		const JSONMember = {
			discord: {
				...member.discord.toJSON(),
				tag: member.discord.user.tag,
				roles: member.discord.roles.cache.toJSON(),
				chat_total_xp: rows[0].chat_xp,
				chat_level: chatLevel.level,
				voice_total_xp: rows[0].voice_xp,
				voice_level: voiceLevel.level,
			},
			wolvesville: member.wolvesville
		};
	
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(JSONMember));
		response.end();
	}
}



module.exports = Route;