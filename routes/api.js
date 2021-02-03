const Axios = require('axios').default;

const route = {
	name: 'api',
	exec: async (url, request, response, pg) => {
		if (url.pathname.startsWith('/api/token')) {
			const { 'rows': tokens } = await pg.query(`SELECT * FROM web_clients WHERE mayze_token = '${url.query.client_token}'`);

			if (tokens.length) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(tokens[0].discord_token);
				return response.end();
			}

			const data = {
				client_id: '703161067982946334',
				client_secret: process.env.CLIENT_SECRET,
				grant_type: 'authorization_code',
				redirect_uri: 'https://mayze2.herokuapp.com0/callback',
				code: url.query.code,
				scope: 'identify guilds',
			};

			Axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(data), {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
				.then(res => {
					pg.query(`INSERT INTO web_clients (mayze_token, discord_token, discord_refresh_token, discord_token_expires_at) VALUES ('${client_token}', '${res.data.access_token}', '${res.data.refresh_token}', '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}')`);

					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(res.data.access_token);
					return response.end();
				})
				.catch(err => {
					console.error(err);
					response.writeHead(400, { 'Content-Type': 'text/html' });
					return response.end('Error fetching token');
				});
		}
	}
};

module.exports = route;