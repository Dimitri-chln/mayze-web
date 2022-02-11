const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');

class Route extends BaseRoute {
	static path = '/api/leaderboard';
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

		const members = Util.guild.members.cache.filter((m) =>
			m.roles.cache.has(Util.config.MEMBER_ROLE_ID),
		);
		const IDs = members.map((m) => m.id);

		Util.database
			.query('SELECT * FROM level WHERE user_id = ANY ($1)', [IDs])
			.then((res) => {
				const data = res.rows.map((row) => {
					const chatLevel = Util.getLevel(row.chat_xp);
					const voiceLevel = Util.getLevel(row.voice_xp);

					return {
						username: members.get(row.user_id).user.username,
						avatar:
							members.get(row.user_id).user.avatarURL() ||
							'https://cdn.discordapp.com/embed/avatars/0.png',
						chat_level: chatLevel.level,
						chat_needed_xp: chatLevel.neededXP,
						chat_total_xp: row.chat_xp,
						chat_rank:
							res.rows.filter((r) => r.chat_xp > row.chat_xp).length + 1,
						voice_level: voiceLevel.level,
						voice_needed_xp: voiceLevel.neededXP,
						voice_total_xp: row.voice_xp,
						voice_rank:
							res.rows.filter((r) => r.voice_xp > row.voice_xp).length + 1,
					};
				});

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(data));
				response.end();
			});
	}
}

module.exports = Route;
