const { IncomingMessage, ServerResponse } = require('http');
const { UrlWithParsedQuery } = require('url');
const { Client } = require('pg');
const Axios = require('axios').default;

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
					case 'token':
						if (request.method !== 'POST' || !url.query.code || !url.query.user_token) {
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

						Axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(data), {
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						})
							.then(async res => {
								await pg.query(`DELETE FROM web_clients WHERE mayze_token = '${url.query.user_token}'`);
								await pg.query(`INSERT INTO web_clients VALUES ('${url.query.user_token}', '${res.data.access_token}', '${res.data.refresh_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}')`);

								setTimeout(() => refreshDiscordToken({
									mayze_token: url.query.user_token,
									discord_token: res.data.access_token,
									discord_refresh_token: res.data.refresh_token,
									discord_token_expires_at: new Date(Date.now() + res.data.expires_in * 1000).toISOString()
								}), res.data.expires_in - 360000);

								response.writeHead(200);
								return response.end();
							})
							.catch(err => {
								console.error(err);

								response.writeHead(400, { 'Content-Type': 'text/html' });
								return response.end('Error fetching token');
							});
						break;
					


					// Get User
					case 'user':
						if (request.method !== 'GET' || !url.query.user_token) {
							response.writeHead(400, { 'Content-Type': 'text/html' });
							return response.end('400 Bad Request');
						}

						const { 'rows': tokens } = await pg.query(`SELECT discord_token FROM web_clients WHERE mayze_token = '${url.query.user_token}'`);
						if (!tokens.length) {
							response.writeHead(404, { 'Content-Type': 'text/html' });
							return response.end('404 Not Found');
						}

						const token = tokens[0].discord_token;

						Axios.get('https://discord.com/api/users/@me', {
							headers: {
								'Authorization': `Bearer ${token}`
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
								return response.end('Error fetching user');
							});
						break;

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



function refreshDiscordToken(tokenInfo) {
	const data = {
		client_id: '703161067982946334',
		client_secret: process.env.CLIENT_SECRET,
		grant_type: 'refresh_token',
		redirect_uri: `${process.env.URL}/callback`,
		refresh_token: tokenInfo.discord_refresh_token,
		scope: 'identify guilds',
	};

	Axios.post(`https://discord.com/api/oauth2/token`, new URLSearchParams(data), {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then(async res => {
			await pg.query(`DELETE FROM web_clients WHERE mayze_token = '${tokenInfo.mayze_token}'`);
			await pg.query(`INSERT INTO web_clients VALUES ('${tokenInfo.mayze_token}', '${res.data.access_token}', '${res.data.refresh_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}')`);
		})
		.catch(console.error);
}

module.exports = route;