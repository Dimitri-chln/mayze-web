const Fs = require('fs');
const Path = require('path');
const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Util = require('./Util');

class BaseRoute {
	static path = '/';
	static methods = ['GET'];
	static requireLogin = false;
	static requireMember = false;

	/**
	 * @param {string} token
	 */
	static async fetchMember(token) {
		if (!this.requireMember) return;

		const { rows: tokens } = await Util.database.query(
			'SELECT user_id FROM web_client WHERE token = $1',
			[token],
		);

		if (!tokens.length) throw new Error('Not Authenticated');

		const userID = tokens[0].user_id;
		const member = Util.guild.members.cache.get(userID);

		if (!member || !member.roles.cache.has(Util.config.MEMBER_ROLE_ID))
			throw new Error('Unauthorized');

		const { rows: wolvesvilleMembers } = await Util.database.query(
			'SELECT * FROM clan_member WHERE user_id = $1',
			[member.user.id],
		);

		const wolvesvilleMember = {
			/**@type {string} */
			userId: wolvesvilleMembers[0].user_id,
			/**@type {string} */
			username: wolvesvilleMembers[0].username,
			/**@type {Date} */
			joinedAt: new Date(wolvesvilleMembers[0].joined_at),
			/**@type {'MEMBER' | 'CO-LEADER' | 'LEADER'} */
			rank: ['MEMBER', 'CO-LEADER', 'LEADER'][wolvesvilleMembers[0].rank - 1],
		};

		return {
			discord: member,
			wolvesville: wolvesvilleMember,
		};
	}

	/**
	 * @param {IncomingMessage} request
	 * @param {string} token
	 */
	static async _validateRequest(request, token) {
		if (!this.methods.includes(request.method.toUpperCase()))
			return 'METHOD_NOT_ALLOWED';

		if (this.requireLogin) {
			const { rows: tokens } = await Util.database.query(
				'SELECT user_id FROM web_client WHERE token = $1',
				[token],
			);

			if (!tokens.length) return 'NOT_AUTHENTICATED';

			if (this.requireMember) {
				const userID = tokens[0].user_id;
				const member = Util.guild.members.cache.get(userID);

				if (!member || !member.roles.cache.has(Util.config.MEMBER_ROLE_ID))
					return 'UNAUTHORIZED';
				else return 'VALID';
			} else return 'VALID';
		} else return 'VALID';
	}

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static runValid(url, request, response, token) {
		const file = Fs.readFileSync(
			Path.join(__dirname, 'routes' + url.pathname, 'index.html'),
		);

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
					message: 'Unauthorized Access',
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
			const file = Fs.readFileSync(
				Path.join(__dirname, 'public/static/html/unauthorized.html'),
			);
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
