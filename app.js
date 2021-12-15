require('dotenv').config();
const Https = require('https');
const Url = require('url');
const Fs = require('fs');
const Util = require('./Util');

const cert = Fs.readFileSync('./ssl/mayze_xyz.crt');
const key = Fs.readFileSync('./ssl/mayze_xyz.key');

Util.connectToDiscord();



const options = {
	cert: cert,
	key: key
};

const httpServer = Https.createServer(options, async (request, response) => {
	const url = new Url.URL(request.url, `${process.env.PROTOCOL}://${process.env.HOSTNAME}`);
	const res = route(url.pathname, request.headers['accept-language']);
	const token = Util.getToken(request);

	if (
		!url.pathname.startsWith("/api") &&
		!url.pathname.startsWith("/images") &&
		!url.pathname.startsWith("/resources") &&
		!url.pathname.startsWith("/modules")
	) {
		const parseIp = (req) => (req.headers['x-forwarded-for'] || "").split(',').shift() || req.socket.remoteAddress;
		Util.discord.channels.cache.get("881479629158891540").send(
			`__Request received:__\n - **IP:** \`${parseIp(request)}\`\n - **Path:** \`${url.pathname}\``
		).catch(console.error);
	}

	// response.setHeader('Content-Language', request.headers['accept-language'] || 'fr-FR');

	switch (res.type) {
		case 'ROUTE':
			try {
				res.route.run(url, request, response, token);
			
			} catch (err) {
				console.error(err);
				response.writeHead(500, { 'Content-Type': 'text/html' });
				response.write('Unknown Internal Server Error');
				response.end();
			}
			break;

		case 'HTML':
 			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.write(res.html);
			response.end();
			break;

		case 'STATIC_FILE':
			try {
				const file = Fs.readFileSync('./static' + url.pathname);

				response.writeHead(200, { 'Content-Type': Util.getContentType(url.pathname) });
				response.write(file);
				response.end();
			
			} catch (err) {
				const file404 = Fs.readFileSync('./static/resources/html/404.html');

				response.writeHead(404, { 'Content-Type': 'text/html' });
				response.write(file404);
				response.end();
			}
			break;
		}

})
	.listen(process.env.PORT || 8000);

console.log(`Listening on port ${httpServer.address().port}`);




// Delete the tokens from the database when they expired
setInterval(() => Util.database.query('SELECT token, expires_at, user_id, discord_expires_at FROM web_clients').then(res => {
	for (const row of res.rows) {
		if (new Date(row.expires_at).valueOf() < Date.now()) {
			Util.database.query(`DELETE FROM web_clients WHERE token = '${row.token}'`).catch(console.error);
		}

		if (new Date(row.discord_expires_at).valueOf() < Date.now()) {
			Util.database.query(`DELETE FROM web_clients WHERE user_id = '${row.user_id}'`).catch(console.error);
		}
	}
}), 60000);



/**
 * Find a route
 * @param {string} path The path of the request
 * @param {string} lang The accept-language header of the request
 * @returns {Route}
 */
function route(path, lang) {
	const languageList = {
		'fr': /^fr(?:-fr|-FR)?/,
		'en': /^en(?:-US)?/
	};

	const fullPath = './routes' + path + (path.endsWith('/') ? '' : '/');
	const language = Object.keys(languageList).find(l => languageList[l].test(lang)) || 'fr';
	
	try {
		const route = require(fullPath + 'route');

		return {
			type: 'ROUTE',
			route: route
		}

	} catch (err) {
		try {
			let html = Fs.readFileSync(fullPath + language + '/index.html').toString();
			html = Util.completeHtmlFile(html);

			return {
				type: 'HTML',
				html: html
			}
		
		} catch (err) {
			try {
				let html = Fs.readFileSync(fullPath + '/index.html').toString();
				html = Util.completeHtmlFile(html);

				return {
					type: 'HTML',
					html: html
				}
			
			} catch(err) {
				return {
					type: 'STATIC_FILE'
				}
			}
		}
	}
}

/**
 * @typedef {object} RouteObject
 * @property {string} name
 * @property {(url: Url.URL, request: Http.IncomingMessage, response: Http.ServerResponse, token: string) => Promise<void>} run
 */

/**
 * @typedef {object} Route
 * @property {'ROUTE' | 'HTML' | 'STATIC_FILE'} type
 * @property {RouteObject} [route]
 * @property {Buffer} [html]
 */
