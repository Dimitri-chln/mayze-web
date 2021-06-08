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
        const mayzeToken = url.searchParams.get('token') || token;

		if (!mayzeToken) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		const { 'rows': tokens } = await pg.query(`SELECT discord_user_id FROM web_clients WHERE '${token}' = ANY (mayze_tokens)`);
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

		switch (request.method) {
			case 'GET':
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
				break;
			
			case 'POST':
				if (!member || !member.roles.cache.some(r => r.id === '696751852267765872' || r.id === '696751614177837056')) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify({
						status: 404,
						message: 'Not A Co-Leader'
					}));
					return response.end();
				}
		
				await pg.query(`INSERT INTO clan_members VALUES ('${url.searchParams.get('username')}', '${url.searchParams.get('joined_at')}', '${url.searchParams.get('user_id')}', ${url.searchParams.get('rank')})`)
					.catch(err => {
						console.error(err);
						response.writeHead(500);
						response.end();
					});
		
				response.writeHead(200);
				response.end();
				break;

			case 'PATCH':
				if (!member || !member.roles.cache.some(r => r.id === '696751852267765872' || r.id === '696751614177837056')) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify({
						status: 404,
						message: 'Not A Co-Leader'
					}));
					return response.end();
				}
		
				await pg.query(`UPDATE clan_members SET username = '${url.searchParams.get('username')}', user_id = '${url.searchParams.get('user_id')}', joined_at = '${url.searchParams.get('joined_at')}', rank = ${url.searchParams.get('rank')} WHERE username = '${url.searchParams.get('member')}'`)
					.catch(err => {
						console.error(err);
						response.writeHead(500);
						response.end();
					});
		
				response.writeHead(200);
				response.end();
				break;

			case 'DELETE':
				if (!member || !member.roles.cache.some(r => r.id === '696751852267765872' || r.id === '696751614177837056')) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify({
						status: 404,
						message: 'Not A Co-Leader'
					}));
					return response.end();
				}
				
				await pg.query(`DELETE FROM clan_members WHERE username = '${url.searchParams.get('member')}'`)
					.catch(err => {
						console.error(err);
						response.writeHead(500);
						response.end();
					});

				response.writeHead(200);
				response.end();
				break;

			default:
				response.writeHead(400, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify({
					status: 400,
					message: 'Bad Request'
				}));
				return response.end();
		}
    }
};

module.exports = route;