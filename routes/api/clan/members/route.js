const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'members',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
        if (request.method.toUpperCase() !== 'GET' || !url.searchParams.has('token')) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
        }

        const { 'rows': tokens } = await pg.query(`SELECT discord_user_id FROM web_clients WHERE '${url.searchParams.get('token')}' = ANY (mayze_tokens)`);
		if (!tokens.length) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 401,
				message: 'Not Connected'
			}));
			return response.end();
		}

        const userID = tokens[0].discord_user_id;
        const guild = discord.guilds.cache.get('689164798264606784');
        const member = guild.members.cache.get(userID);

		if (member && member.roles.cache.has('689169027922526235')) {
            pg.query('SELECT * FROM clan_members ORDER BY joined_at ASC')
				.then(async res => {
					const data = await Promise.all(res.rows.map(async m => {
						if (m.user_id) m.user = (await discord.users.fetch(m.user_id).catch(console.error)) || null;
						return m;
					}));
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

        } else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 404,
				message: 'Not A Member'
			}));
			return response.end();
        }
    }
};

module.exports = route;