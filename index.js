const http = require('http');
const URL = require('url');
const fs = require('fs');
const path = require('path');

http.createServer(async (request, response) => {
	const url = URL.parse(request.url, true);

	fs.readFile(url.path, (err, buffer) => {
		if (!err) response.write(buffer);
		else {
			if (err.code === 'ENOENT') response.writeHead(404, 'File not found');
		}

		response.end();
	});

}).listen(process.env.PORT || 5000);