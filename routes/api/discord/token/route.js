const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;
const { refreshDiscordToken } = require('../../../../utils.js');

const route = {
	name: 'token',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
		if (request.method.toUpperCase() !== 'POST' || !url.searchParams.has('code') || !url.searchParams.has('token')) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		const data = {
			client_id: '703161067982946334',
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'authorization_code',
			redirect_uri: `${process.env.URL}/callback`,
			code: url.searchParams.get('code'),
			scope: 'identify',
		};

		const res = await Axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(err => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving token');
		});

		const user = await Axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${res.data.access_token}` } }).catch(err => {
			console.error(err);
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('Error retrieving user');
		});

		const { 'rows': tokens } = await pg.query(`SELECT * FROM web_clients WHERE discord_user_id = '${user.data.id}'`);

		if (!tokens.length) {
			await pg.query(`INSERT INTO web_clients VALUES ('${user.data.id}', '${res.data.access_token}', '{ "${url.searchParams.get('token')}" }', '${res.data.refresh_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}')`);
		} else {
			const new_mayze_tokens = tokens[0].mayze_tokens;
			new_mayze_tokens.push(url.searchParams.get('token'));
			await pg.query(`UPDATE web_clients SET discord_token = '${res.data.access_token}', discord_refresh_token = '${res.data.refresh_token}', mayze_tokens = '{ "${new_mayze_tokens.join('", "')}" }', expires_at = '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}' WHERE discord_user_id = '${user.data.id}'`);
		}				

		// setTimeout(() => refreshDiscordToken(pg, url.searchParams.get('token'), res.data.refresh_token), res.data.expires_in - 3600000);

		response.writeHead(200);
		response.end();
	}
};

module.exports = route;