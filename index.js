const HTTP = require('http');
const URL = require('url');
const FS = require('fs');

HTTP.createServer(async (request, response) => {	
	const url = URL.parse(request.url, true);
	console.log(url);

	FS.readFile(`assets${url.path}`, (err, buffer) => {
		// if (!err) response.write(buffer);
		// else {
		// 	if (err.code === 'ENOENT') response.writeHead(404, 'File not found');
		// }

		response.end();
	});

}).listen(8080);