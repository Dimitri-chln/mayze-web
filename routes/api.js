const { IncomingMessage, ServerResponse } = require('http');
const { UrlWithParsedQuery } = require('url');
const { Client } = require('pg');
const Axios = require('axios').default;
const { refreshDiscordToken } = require('../utils.js');

const route = {
	name: 'api',
	/**
	 * @param {UrlWithParsedQuery} url 
	 * @param {string[]} slashes 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Client} pg 
	 */
	exec: async (url, slashes, request, response, pg) => {

		switch (slashes[1]) {
			// Get Discord data
			case 'discord':
				
				switch (slashes[2]) {
					// Create a new Discord access token
					case 'token': {
						if (request.method.toUpperCase() !== 'POST' || !url.query.code || !url.query.user_token) {
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('400 Bad Request');
						}

						const data = {
							client_id: '703161067982946334',
							client_secret: process.env.CLIENT_SECRET,
							grant_type: 'authorization_code',
							redirect_uri: `${process.env.URL}/callback`,
							code: url.query.code,
							scope: 'identify guilds',
						};

						const res = await Axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(err => {
							console.error(err);
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('Error retrieving token');
						});

						const user = await Axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${res.data.access_token}` } }).catch(err => {
							console.error(err);
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('Error retrieving token');
						});

						const { 'rows': tokens } = await pg.query(`SELECT * FROM web_clients WHERE discord_user_id = '${user.data.id}'`);

						if (!tokens.length) {
							await pg.query(`INSERT INTO web_clients VALUES ('${user.data.id}', '${res.data.access_token}', '{ "${url.query.user_token}" }', '${res.data.refresh_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}')`);
						} else {
							const new_mayze_tokens = tokens[0].mayze_tokens;
							new_mayze_tokens.push(url.query.user_token);
							await pg.query(`UPDATE web_clients SET discord_token = '${res.data.access_token}', discord_refresh_token = '${res.data.refresh_token}', mayze_tokens = '{ "${new_mayze_tokens.join('", "')}" }', expires_at = '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}' WHERE discord_user_id = '${user.data.id}'`);
						}				

						setTimeout(() => refreshDiscordToken(pg, url.query.user_token, res.data.refresh_token), res.data.expires_in - 3600000);

						response.writeHead(200);
						response.end();
						break;
					}
					


					// Get User
					case 'user': {
						if (request.method.toUpperCase() !== 'GET' || !url.query.user_token) {
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('400 Bad Request');
						}

						const { 'rows': tokens } = await pg.query(`SELECT discord_token FROM web_clients WHERE '${url.query.user_token}' = ANY (mayze_tokens)`);
						if (!tokens.length) {
							response.writeHead(404, { 'Content-Type': 'text/html' });
							return response.end('404 Not Found');
						}

						const token = tokens[0].discord_token;

						Axios.get('https://discord.com/api/users/@me', {
							headers: {
								Authorization: `Bearer ${token}`
							}
						})
							.then(res => {
								response.writeHead(200, { 'Content-Type': 'application/json' });
								response.write(JSON.stringify(res.data));
								return response.end();
							})
							.catch(err => {
								console.error(err);

								response.writeHead(400, { 'Content-Type': 'text/html' });
								return response.end('Error retrieving user');
							});
						break;
					}



					// Retrieve user's guilds
					case 'guilds': {
						if (request.method.toUpperCase() !== 'GET' || !url.query.user_token) {
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('400 Bad Request');
						}

						const { 'rows': tokens } = await pg.query(`SELECT discord_token FROM web_clients WHERE '${url.query.user_token}' = ANY (mayze_tokens)`);
						if (!tokens.length) {
							response.writeHead(404, { 'Content-Type': 'text/html' });
							return response.end('404 Not Found');
						}

						const token = tokens[0].discord_token;

						Axios.get('https://discord.com/api/users/@me/guilds', {
							headers: {
								Authorization: `Bearer ${token}`
							}
						})
							.then(res => {
								response.writeHead(200, { 'Content-Type': 'application/json' });
								response.write(JSON.stringify(res.data));
								return response.end();
							})
							.catch(err => {
								console.error(err);

								response.writeHead(400, { 'Content-Type': 'text/html' });
								return response.end('Error retrieving guilds');
							});
						break;
					}

					

					// Disconnect from Discord
					case 'logout': {
						if (request.method.toUpperCase() !== 'POST' || !url.query.user_token) {
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('400 Bad Request');
						}

						const { 'rows': tokens } = await pg.query(`SELECT mayze_tokens FROM web_clients WHERE '${url.query.user_token}' = ANY (mayze_tokens)`);
						
						if (tokens.length > 1)
							await pg.query(`UPDATE web_clients SET mayze_tokens = '{ "${tokens[0].mayze_tokens.filter(t => t !== url.query.user_token).join('", "')}" }' WHERE '${url.query.user_token}' = ANY (mayze_tokens)`);
						else if (tokens.length === 1)
							await pg.query(`DELETE FROM web_clients WHERE '${url.query.user_token}' = ANY (mayze_tokens)`);

						response.writeHead(200);
						response.end();
						break;
					}



					default:
						response.writeHead(404, { 'Content-Type': 'text/html' });
						return response.end('404 Not Found');
				}
				break;

			default:
				response.writeHead(404, { 'Content-Type': 'text/html' });
				return response.end('404 Not Found');
		}
	}
};

module.exports = route;