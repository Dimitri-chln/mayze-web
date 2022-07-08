const BaseRoute = require('../../BaseRoute');
const Util = require('../../Util');
const Fs = require('fs');
const Path = require('path');

class Route extends BaseRoute {
	static path = '/translations';
	static loginRequired = true;
	static allowedUserIds = ['463358584583880704', '701832883236634754'];

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runValid(url, request, response, token) {
		const LOCALE_LIST = {
			'fr': /fr/,
			'en-US': /en/,
			'de': /de/,
			'nl': /nl/,
		};

		const locale =
			url.searchParams.get('locale') ??
			Object.keys(LOCALE_LIST).find((l) => LOCALE_LIST[l].test(request.headers['accept-language'])) ??
			'fr';

		const baseFile = Fs.readFileSync(Path.join(__dirname, 'index.html'));
		const file = Buffer.from(
			baseFile
				.toString()
				.replace(
					new RegExp(`<option value="${locale}">(.+)<\/option>`),
					`<option value="${locale}" selected>$1<\/option>`,
				),
		);

		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(Util.addBaseURI(Util.completeHtmlFile(file)));

		return response.end();
	}
}

module.exports = Route;
