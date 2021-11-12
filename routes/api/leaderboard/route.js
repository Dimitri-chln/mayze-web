const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('../../../Util');



const route = {
	name: 'leaderboard',
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

		const { 'rows': tokens } = await Util.database.query(`SELECT user_id FROM web_clients WHERE token = '${mayzeToken}'`);
		if (!tokens.length) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 401,
				message: 'Not Connected'
			}));
			return response.end();
		}

		const userID = tokens[0].user_id;
		const guild = Util.discord.guilds.cache.get('689164798264606784');
		const member = guild.members.cache.get(userID);
		
		if (member && member.roles.cache.has('689169027922526235')) {
			const guild = Util.discord.guilds.cache.get('689164798264606784');
			const members = guild.members.cache.filter(m => m.roles.cache.has('689169027922526235'));
			const IDs = members.map(m => m.id);

			Util.database.query(`SELECT * FROM levels WHERE user_id = ANY ('{ "${IDs.join('", "')}" }') ORDER BY chat_xp DESC`)
				.then(res => {
					const data = res.rows.map((row, i) => {
						const level = getLevel(row.chat_xp);
						return { rank: i + 1, username: members.get(row.user_id).user.username, avatar: members.get(row.user_id).user.avatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png', level: level[0], xp: level[1], totalXP: row.chat_xp };
					});

					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify(data));
					response.end();
				})
				.catch(err => {
					console.error(err);

					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify({
						status: 500,
						message: 'Internal Server Error'
					}));
					response.end();
				});
			
			function getLevel(xp, lvl = 0) {
				const xpPerLevel = 1000 + lvl * 250;
				if (xp < xpPerLevel) return [ lvl, xp ];
				return getLevel(xp - xpPerLevel, lvl + 1);
			}

		} else {
			response.writeHead(403, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 403,
				message: 'Not A Member'
			}));
			return response.end();
		}
	}
};

module.exports = route;