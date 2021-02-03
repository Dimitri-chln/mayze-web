require('dotenv').config();
const Http = require('http');
const Url = require('url');
const Fs = require('fs');
const Path = require('path');
const Axios = require('axios').default;
const { Client } = require('pg');
const { getContentType } = require('./util');

let pg = newPgClient();
pg.connect().then(() => console.log("Connected to the database")).catch(console.error);
setInterval(reconnectPgClient, 3600000);

const routes = new Map();
const routesFiles = Fs.readdirSync('./routes').filter(file => file.endsWith('.js'));
for (const file of routesFiles) {
	const route = require(`./routes/${file}`);
	routes.set(route.name, route);
}

Http.createServer(async (request, response) => {
	const url = Url.parse(request.url, true);
	const slashes = url.pathname.split('/').slice(1);
	const path = Path.extname(url.path)
		? 'server' + url.pathname
		: 'server' + (url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`) + 'index.html';

	const route = routes.get(slashes[0]);

	if (route) {
		route.exec(url, request, response, pg);
	} else {
		Fs.readFile(path, (err, data) => {
			if (err) {
				response.writeHead(404, { 'Content-Type': 'text/html' });
				return response.end('404 Not Found');
			} else {
				response.writeHead(200, { 'Content-Type': getContentType(path) });
				response.write(data);
				return response.end();
			}
		});
	}

}).listen(process.env.PORT || 5000);
console.log(`Listening on port ${process.env.PORT || 5000}`);



// Ping the server every 10 minutes
setInterval(() => {
	Axios.get(process.env.URL).then(() => {
		console.log("Pinging server...");
	}).catch(err => console.error('Error pinging the server'));
}, 600000);


// Create a PostgreSQL client
function newPgClient() {
	const connectionString = {
		connectionString: process.env.DATABASE_URL,
		ssl: true
	};
	const pgClient = new Client(connectionString);

	pgClient.on("error", err => {
		console.error(err);
		client.pg.end().catch(console.error);
		newPgClient();
	});

	return pgClient;
}

function reconnectPgClient() {
	pg.end().catch(console.error);
	pg = newPgClient();
	pg.connect().then(() => console.log("Connected to the database")).catch(console.error);
}