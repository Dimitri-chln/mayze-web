require('dotenv').config();
const Http = require('http');
const Url = require('url');
const Fs = require('fs').promises;
const Path = require('path');
const Axios = require('axios').default;
const Pg = require('pg');
const Discord = require('discord.js');
const { getContentType, refreshDiscordToken, generateRandomString } = require('./utils');

const discord = new Discord.Client({ disableMentions: 'everyone', fetchAllMembers: true });
discord.login(process.env.TOKEN);
discord.on('ready', () => console.log('Connected to Discord'));

let pg = newPgClient();
pg.connect().then(() => console.log('Connected to the database')).catch(console.error);
setInterval(reconnectPgClient, 3600000);

const server = Http.createServer(async (request, response) => {
	const url = new Url.URL(request.url, process.env.URL);
	const res = await findRoute(url.pathname, request.headers['accept-language']);
	const token = getToken(request);

	response.setHeader('Content-Language', res.lang);

	if (res.route) res.route.run(url, request, response, discord, pg, token);

	else if (res.html) {
		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(res.html);
		response.end();

	} else {
		Fs.readFile('./public' + url.pathname)
			.then(buffer => {
				response.writeHead(200, { 'Content-Type': getContentType(url.pathname) });
				response.write(buffer);
				response.end();
			})
			.catch(err => {
				response.writeHead(404, { 'Content-Type': 'text/html' });
				response.end('404 Not Found');
			});
	}

})
	.listen(process.env.PORT || 8000);

console.log(`Listening on port ${server.address().port}`);



// Delete the tokens from the database when they expired
setInterval(() => pg.query('SELECT token, expires_at, user_id, discord_expires_at FROM web_clients').then(res => {
	for (const row of res.rows) {
		if (new Date(row.expires_at).valueOf() < Date.now()) {
			pg.query(`DELETE FROM web_clients WHERE token = '${row.token}'`).catch(console.error);
		}

		if (new Date(row.discord_expires_at).valueOf() < Date.now()) {
			pg.query(`DELETE FROM web_clients WHERE user_id = '${row.user_id}'`).catch(console.error);
		}
	}
}), 60000);



// Ping the server every 10 minutes
// setInterval(() => {
// 	Axios.get(process.env.URL).then(() => {
// 		console.log('Pinging server...');
// 	}).catch(err => console.error('Error pinging the server'));
// }, 600000);



// Refresh Discord access tokens
// pg.query('SELECT * FROM web_clients').then(res => {
// 	for (const tokenInfo of res.rows) {
// 		let expires_in = Date.parse(tokenInfo.expires_at) - Date.now();

// 		if (expires_in < 3600000) refreshDiscordToken(tokenInfo);
// 		else setTimeout(() => refreshDiscordToken(pg, tokenInfo.mayze_tokens[0], tokenInfo.refresh_token), expires_in - 3600000);
// 	}
// })
// .catch(console.error);



// Create a PostgreSQL client
function newPgClient() {
	const connectionString = {
		connectionString: process.env.DATABASE_URL,
		ssl: true
	};
	const pgClient = new Pg.Client(connectionString);

	pgClient.on('error', err => {
		console.error(err);
		client.pg.end().catch(console.error);
		newPgClient();
	});

	return pgClient;
}

function reconnectPgClient() {
	pg.end().catch(console.error);
	pg = newPgClient();
	pg.connect().then(() => console.log('Connected to the database')).catch(console.error);
}



/**
 * Find a route
 * @param {string} path The path of the route
 */
async function findRoute(path, language) {
	const languageList = {
		'fr': /^fr(?:-fr|-FR)?/,
		'en': /^en(?:-US)?/
	};

	const fullPath = './routes' + path + (path.endsWith('/') ? '' : '/');
	const lang = Object.keys(languageList).find(l => languageList[l].test(language)) || 'fr';
	
	try {
		const route = require(fullPath + 'route');
		return { route, lang };

	} catch (err) {
		const html = 
		(await Fs.readFile(fullPath + lang + '/index.html').catch(err => {
			if (err.code !== 'ENOENT') console.error(err);
		})) ||
		(await Fs.readFile(fullPath + 'index.html').catch(err => {
			if (err.code !== 'ENOENT') console.error(err);
		}));

		return { html, lang };
	}
}



/**
 * Get the token from the request cookies
 * @param {Http.IncomingMessage} request The request object
 */
function getToken(request) {
	let { cookie } = request.headers;
	if (!cookie) return '';
	let ca = cookie.split(/ *; */);
	let ctoken = ca.find(c => c.startsWith('token='));
	return ctoken.replace('token=', '');
}