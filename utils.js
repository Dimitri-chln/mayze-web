const Path = require('path');
const Axios = require('axios').default;

function getContentType(path) {
	const ext = Path.extname(path);
	
	switch (ext) {
		case '.png': return 'image/png';
		case '.jpg': return 'image/jpg';
		case '.jpeg': return 'image/jpg';
		case '.gif': return 'image/gif';
		case '.ico': return 'image/x-icon';
		case '.html': return 'text/html';
		case '.css': return 'text/css';
		case '.js': return 'application/javascript';
		case '.mjs': return 'application/javascript';
		case '.json': return 'application/json';
		case '.txt': return 'text/plain';
		default: return 'application/octet-stream';
	}
}

function generateRandomString() {
	const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
	const rand = Math.floor(Math.random() * 10);
	let randStr = '';

	for (let i = 0; i < 40 + rand; i++) {
		randStr += charList.charAt(Math.floor(Math.random() * charList.length));
	}

	return randStr;
}

function refreshDiscordToken(pg, user_token, refresh_token) {
	const data = {
		client_id: '703161067982946334',
		client_secret: process.env.CLIENT_SECRET,
		grant_type: 'refresh_token',
		redirect_uri: `${process.env.URL}/callback`,
		refresh_token,
		scope: 'identify',
	};

	Axios.post(`https://discord.com/api/oauth2/token`, new URLSearchParams(data), {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then(async res => {
			await pg.query(`UPDATE web_clients SET discord_token = '${res.data.access_token}', expires_at = '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}' WHERE '${user_token}' = ANY (mayze_tokens)`);
		})
		.catch(console.error);
}

module.exports = { getContentType, generateRandomString, refreshDiscordToken };