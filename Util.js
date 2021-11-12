const Fs = require("fs");
const Path = require('path');
const Axios = require('axios').default;
const Pg = require('pg');
const Discord = require('discord.js');
const Http = require('http');



class Util {
	/**@type {Pg.Client} */
	static database = newDatabaseClient();

	static discord = new Discord.Client({ disableMentions: 'everyone', fetchAllMembers: true })
		.on('ready', () => console.log('Connected to Discord'));

	static connectToDiscord() {
		this.discord.login(process.env.TOKEN);
	}
	
	/**
	 * Get the token from the request cookies
	 * @param {Http.IncomingMessage} request The request object
	 */
	static getToken(request) {
		const { cookie } = request.headers;
		if (!cookie) return '';
		
		const cookieList = cookie.split(/ *; */);
		const cookieToken = cookieList.find(c => c.startsWith('token='));
		return cookieToken.replace('token=', '');
	}

	/**
	 * @param {string} path 
	 */
	static getContentType(path) {
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

	static generateRandomString() {
		const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
		let randStr = '';

		for (let i = 0; i < 40; i++) {
			randStr += charList.charAt(Math.floor(Math.random() * charList.length));
		}

		return randStr;
	}

	/**
	 * 
	 * @param {*} token 
	 * @param {*} refresh_token 
	 */
	static refreshDiscordToken(token, refresh_token) {
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
				await this.database.query(`UPDATE web_clients SET discord_token = '${res.data.access_token}', expires_at = '${new Date(Date.now() + res.data.expires_in * 1000).toISOString()}' WHERE '${token}' = ANY (mayze_tokens)`);
			})
			.catch(console.error);
	}

	/**
	 * @param {Buffer} incompleteHtml 
	 */
	static completeHtmlFile(incompleteHtml) {
		let defaultHtml = Fs.readFileSync('./public/resources/html/default.html').toString();

		const data = incompleteHtml.toString();
		
		if (!data.startsWith('<!-- Incomplete file -->')) return Buffer.from(incompleteHtml);

		const [ , css ] = data.match(/<!-- CSS -->(.*)<!-- CSS end -->/s) || [];
		const [ , mjs ] = data.match(/<!-- MJS -->(.*)<!-- MJS end -->/s) || [];
		const [ , html ] = data.match(/<!-- HTML -->(.*)<!-- HTML end -->/s) || [];
		
		if (css) defaultHtml = defaultHtml.replace('<!-- CSS here -->', css.trim());
		if (mjs) defaultHtml = defaultHtml.replace('<!-- MJS here -->', mjs.trim());
		if (html) defaultHtml = defaultHtml.replace('<!-- HTML here -->', html.trim());

		return Buffer.from(defaultHtml);
	}
}



function newDatabaseClient() {
	const connectionString = {
		connectionString: process.env.DATABASE_URL,
		ssl: true
	};

	const database = new Pg.Client(connectionString);

	database.on('error', err => {
		console.error(err);
		reconnectDatabase(database);
	});

	database.connect();

	return database;
}

function reconnectDatabase() {
	Util.database.end();
	Util.database = newDatabaseClient();
	Util.database.connect().then(() => console.log('Connected to the database'));
}



module.exports = Util;