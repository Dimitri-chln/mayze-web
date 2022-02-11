const { IncomingMessage, ServerResponse } = require("http");
const { URL } = require("url");
const BaseRoute = require("../../BaseRoute");

const Fs = require("fs");
const Util = require("../../Util");

class Route extends BaseRoute {
	static path = "/static";

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get("token") || token;

		const file = Fs.readFileSync("./public" + url.pathname);

		response.writeHead(200, {
			"Content-Type": Util.getContentType(url.pathname),
			"Content-Length": file.byteLength
		});
		response.write(file);
		response.end();
	}
}

module.exports = Route;
