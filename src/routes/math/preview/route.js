const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Katex = require('katex');
const NodeHTMLToImage = require('node-html-to-image');

class Route extends BaseRoute {
	static path = '/math/preview';

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const text = `{\\huge ${Buffer.from(url.searchParams.get('text'), 'base64').toString()} }`;

		const htmlRender = `
			<html>
				<head>
					<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC" crossorigin="anonymous" />
					<style>
						#screenshot {
							width: fit-content;
							height: fit-content;
							padding: 1em;
						}
					</style>
				</head>
				<body>
					<div id="screenshot">${Katex.renderToString(text)}</div>
				</body>
			</html>
			`;

		const image = await NodeHTMLToImage({ html: htmlRender, selector: '#screenshot' });

		response.writeHead(200, { 'Content-Type': 'image/png' });
		response.write(image);
		response.end();
	}
}

module.exports = Route;
