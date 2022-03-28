const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');

class Route extends BaseRoute {
	static path = '/api/translations';
	static methods = ['GET', 'POST'];
	static loginRequired = true;
	static allowedUserIds = ['463358584583880704'];

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const user = await this.fetchUser(token);

		switch (request.method.toUpperCase()) {
			case 'GET': {
				const { rows } = await Util.database.query('SELECT * FROM translations');

				const data = {};

				for (const row of rows) {
					const elements = row.name.split('.');
					let object = data;

					elements.forEach((e, i) => {
						if (!object[e]) object[e] = {};
						if (i < elements.length - 1) object = object[e];
					});

					object[elements[elements.length - 1]] = {
						default: row.default,
						translations: Object.entries(row).reduce((o, value) => {
							if (value[0] !== 'name' && value[0] !== 'default') o[value[0]] = value[1];
							return o;
						}, {}),
					};
				}

				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.write(JSON.stringify(data));
				response.end();
				break;
			}

			case 'POST': {
				const translationName = url.searchParams.get('name');
				const locale = url.searchParams.get('locale');
				const translation = url.searchParams.get('translation');

				if (!translationName || !locale || !translation) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				const {
					rows: [translationData],
				} = await Util.database.query(`SELECT ${locale} FROM translations WHERE name = $1`, [translationName]);

				if (translationData) {
					await Util.database.query(`UPDATE translations SET ${locale} = $1 WHERE name = $2`, [
						translation === 'NULL' ? null : translation,
						translationName,
					]);

					Util.discord.channels.cache
						.get('957380495958765588')
						.send(
							`
							__Translations updated:__
							- **By:** \`${user.tag} (${user.id})\`
							- **Name:** \`${translationName}\`
							- **Locale:** \`${locale}\`
							- **Old value:**
							\`\`\`
							${translationData[locale]}
							\`\`\`
							- **New value:**
							\`\`\`
							${translation}
							\`\`\`
							`.replace(/\t*/g, ''),
						)
						.catch(console.error);

					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end();
				} else {
					response.writeHead(404, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 404,
							message: 'Not Found',
						}),
					);
					response.end();
				}
				break;
			}
		}
	}
}

module.exports = Route;
