const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'edit',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
		if (request.method.toUpperCase() !== 'POST' || !token || !url.searchParams.has('member') || !url.searchParams.has('username') || !url.searchParams.has('user_id') || !url.searchParams.has('joined_at') || !url.searchParams.has('rank')) {
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
	}
};

module.exports = route;