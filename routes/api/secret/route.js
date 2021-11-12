const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Axios = require("axios").default;
const Util = require('../../../Util');



const route = {
	name: 'secret',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {string} token 
	 */
	run: async (url, request, response, token) => {
		const mayzeToken = url.searchParams.get('token') || token;

		if (request.method.toUpperCase() !== 'POST' || !mayzeToken) {
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
			Util.discord.channels.cache.get('907603255402578003').send(`${member.user} (${member.user.tag}) a trouvé le secret !`)
				.then(() => {
					response.writeHead(200);
       				response.end();
				});

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