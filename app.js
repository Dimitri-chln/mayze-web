require('dotenv').config();
const Http = require('http');
const Url = require('url');
const Fs = require('fs');
const GeoIP = require('geoip-lite');
const Util = require('./Util');
const Route = require('./BaseRoute');

const cert = Fs.readFileSync('./ssl/cert.pem');
const key = Fs.readFileSync('./ssl/key.pem');

Util.connectToDiscord();



const LANGUAGE_LIST = {
	'fr': /^fr(?:-fr|-FR)?/,
	'en': /^en(?:-US)?/
};

const OPTIONS = {
	cert: cert,
	key: key
};

const httpServer = Http.createServer(/*OPTIONS,*/ async (request, response) => {
	const url = new Url.URL(request.url, `${process.env.PROTOCOL}://${process.env.HOSTNAME}`);
	const token = Util.getToken(request);

	const filePath = './routes' + url.pathname + (url.pathname.endsWith('/') ? '' : '/');
	const language = Object.keys(LANGUAGE_LIST).find(l => LANGUAGE_LIST[l].test(request.headers['accept-language'])) || 'fr';
	// response.setHeader('Content-Language', request.headers['accept-language'] || 'fr-FR');

	try {
		/**@type {typeof Route} */
		const route = require(filePath + 'route');
		route.run(url, request, response, token)
			.catch(err => {
				console.error(err);
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.write({
					status: 500,
					message: 'Internal Server Error'
				});
				response.end();
			});

	// If the route doesn't exist, try finding a static file
	} catch(err) {
		try {
			const file = Fs.readFileSync('./static' + url.pathname);

			response.writeHead(200, { 'Content-Type': Util.getContentType(url.pathname) });
			response.write(file);
			response.end();
		
		// If no file is found, send the 404 file
		} catch (err) {
			if (url.pathname.startsWith('/api')) {
				response.writeHead(404, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify({
					status: 404,
					message: 'Not Found'
				}));

			} else {
				const file404 = Fs.readFileSync('./static/resources/html/404.html');

				response.writeHead(404, { 'Content-Type': 'text/html' });
				response.write(file404);
				response.end();
			}
		}
	}

	if (
		!url.pathname.startsWith("/api") &&
		!url.pathname.startsWith("/images") &&
		!url.pathname.startsWith("/resources") &&
		!url.pathname.startsWith("/modules")
	) {
		const parseIP = (req) => (req.headers['x-forwarded-for'] || "").split(',').shift() || req.socket.remoteAddress;
		const IP = parseIP(request);
		const geo = GeoIP.lookup(IP);

		Util.discord.channels.cache.get('881479629158891540').send(
			`__Request received:__
			 - **Path:** \`${url.pathname}\`
			 - **IP:** \`${IP}\`
			 - **Country:** \`${geo.country}\`
			 - **City:** \`${geo.city}\`
			 - **Lat. long.:** \`${geo.ll}\``.replace(/\t/g, '')
		).catch(console.error);
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
