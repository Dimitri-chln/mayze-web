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
			'463358584583880704': 'nl',
			'701832883236634754': 'pt-BR',
		};
		
		const {
			rows: [tokenData],
		} = await Util.database.query('SELECT user_id FROM web_client WHERE token = $1', [token]);

		const locale =
			url.searchParams.get('locale') ??
			LOCALE_LIST[tokenData.user_id] ??
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
