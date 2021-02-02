const Http = require('http');
const Https = require('https');
const Url = require('url');
const Fs = require('fs');
const Path = require('path');

Http.createServer(async (request, response) => {
	const url = Url.parse(request.url, true);
	const path = Path.extname(url.path)
		? 'server' + url.pathname
		: 'server' + (url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`) + 'index.html';

	Fs.readFile(path, (err, data) => {
		if (err) {
			response.writeHead(404, { 'Content-Type': 'text/html' });
			return response.end('404 Not Found');
		} 
		response.writeHead(200, { 'Content-Type': getContentType(path) });
		response.write(data);
		return response.end();
	});

}).listen(process.env.PORT || 5000);

// Ping the server every 10 minutes
setInterval(() => {
	Https.get(process.env.URL, () => {
		console.log("Pinging server...");
	});
}, 600000);

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