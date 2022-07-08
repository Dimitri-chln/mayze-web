const Fs = require('fs');
const Path = require('path');
const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('./Util');

class BaseRoute {
	static path = '/';
	static methods = ['GET'];
	static loginRequired = false;
	static memberRequired = false;
	static allowedUserIds = null;

	/**
	 * @param {string} token
	 */
	static async fetchUser(token) {
		const { rows: tokens } = await Util.database.query('SELECT user_id FROM web_client WHERE token = $1', [token]);

		if (!tokens.length) throw new Error('Not Authenticated');

		const userId = tokens[0].user_id;
		const user = await Util.discord.users.fetch(userId);

		return user;
	}

	/**
	 * @param {string} token
	 */
	static async fetchMember(token) {
		if (!this.memberRequired) return;

		const { rows: tokens } = await Util.database.query('SELECT user_id FROM web_client WHERE token = $1', [token]);

		if (!tokens.length) throw new Error('Not Authenticated');

		const userId = tokens[0].user_id;

		if (!Util.guild.members.cache.has(userId)) throw new Error('Unauthorized');

		const member = Util.guild.members.cache.get(userId);

		const {
			rows: [wolvesvilleMember],
		} = await Util.database.query('SELECT * FROM clan_member WHERE user_id = $1', [member.user.id]);

		/**
		 * @typedef {object} WolvesvilleMember
		 * @property {string} userId The discord user ID of the member
		 * @property {string} username The wolvesville username of the member
		 * @property {Date} joinedAt The date the member joined the clan
		 * @property {'MEMBER' | 'CO-LEADER' | 'LEADER'} rank The rank of the member in the clan
		 */

		return {
			discord: member,
			/**
			 * @type {WolvesvilleMember}
			 */
			wolvesville: wolvesvilleMember
				? {
						userId: wolvesvilleMember.user_id,
						username: wolvesvilleMember.username,
						joinedAt: new Date(wolvesvilleMember.joined_at),
						rank: ['MEMBER', 'CO-LEADER', 'LEADER'][wolvesvilleMember.rank - 1],
				  }
				: null,
		};
	}

	/**
	 * @param {IncomingMessage} request
	 * @param {string} token
	 */
	static async _validateRequest(request, token) {
		if (!this.methods.includes(request.method.toUpperCase())) return 'METHOD_NOT_ALLOWED';

		if (this.loginRequired) {
			const {
				rows: [tokenData],
			} = await Util.database.query('SELECT user_id FROM web_client WHERE token = $1', [token]);

			if (!tokenData) return 'NOT_AUTHENTICATED';

			if (this.memberRequired && !Util.guild.members.cache.has(tokenData.user_id)) return 'UNAUTHORIZED';

			if (
				this.allowedUserIds &&
				!this.allowedUserIds.includes(tokenData.user_id) &&
				tokenData.user_id !== Util.config.ONWER_ID
			)
				return 'UNAUTHORIZED';
		}

		return 'VALID';
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runValid(url, request, response, token) {
		const file = Fs.readFileSync(Path.join(__dirname, 'routes' + url.pathname, 'index.html'));

		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(Util.addBaseURI(Util.completeHtmlFile(file)));

		return response.end();
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runMethodNotAllowed(url, request, response, token) {
		response.writeHead(405, { 'Content-Type': 'application/json' });
		response.write(
			JSON.stringify({
				status: 405,
				message: 'Method Not Allowed',
			}),
		);

		return response.end();
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runNotAuthenticated(url, request, response, token) {
		if (this.path.startsWith('/api')) {
			response.writeHead(401, { 'Content-Type': 'application/json' });
			response.write(
				JSON.stringify({
					status: 401,
					message: 'Not Authenticated',
				}),
			);
		} else {
			response.writeHead(307, {
				Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
			});
		}

		return response.end();
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runUnauthorized(url, request, response, token) {
		if (this.path.startsWith('/api')) {
			response.writeHead(401, { 'Content-Type': 'application/json' });
			response.write(
				JSON.stringify({
					status: 401,
					message: 'Unauthorized Access',
				}),
			);
		} else {
			const file = Fs.readFileSync(Path.join(__dirname, 'public/static/html/unauthorized.html'));
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.write(file);
		}

		return response.end();
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async run(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		switch (await this._validateRequest(request, token)) {
			case 'VALID':
				this.runValid(url, request, response, token);
				break;

			case 'METHOD_NOT_ALLOWED': {
				this.runMethodNotAllowed(url, request, response, token);
				break;
			}

			case 'NOT_AUTHENTICATED': {
				this.runNotAuthenticated(url, request, response, token);
				break;
			}

			case 'UNAUTHORIZED': {
				this.runUnauthorized(url, request, response, token);
				break;
			}
		}
	}
}

module.exports = BaseRoute;
