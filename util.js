const Path = require('path');

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

module.exports = { getContentType, generateRandomString };