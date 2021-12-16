const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');



class Route extends BaseRoute {
	static path = '/api/leaderboard';
	static requireLogin = true;
	
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		const members = Util.guild.members.cache.filter(m => m.roles.cache.has(Util.config.MEMBER_ROLE_ID));
		const IDs = members.map(m => m.id);

		Util.database.query(`SELECT * FROM levels WHERE user_id = ANY ('{ "${IDs.join('", "')}" }') ORDER BY chat_xp DESC`)
			.then(res => {
				const data = res.rows.map((row, i) => {
					const level = getLevel(row.chat_xp);
					return {
						rank: i + 1,
						username: members.get(row.user_id).user.username,
						avatar: members.get(row.user_id).user.avatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png',
						level: level.level,
						needed_xp: level.neededXP,
						total_xp: row.chat_xp
					};
				});

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(data));
				response.end();
			});
	}
}



/**
 * @param {number} xp
 * @param {number} [level]
 * @returns {{ level: number, currentXP: number, neededXP: number }}
 */
function getLevel(xp, level = 0) {
	 const xpForLevel = Util.config.BASE_XP + level * Util.config.XP_INCREMENT;
	 
	 if (xp < xpForLevel)
		 return { level, currentXP: xp, neededXP: xpForLevel };
	 
	 return getLevel(xp - xpForLevel, level + 1);
 }



module.exports = Route;