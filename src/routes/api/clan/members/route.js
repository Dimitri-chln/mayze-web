const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../../BaseRoute');
const Util = require('../../../../Util');
const { GuildMember } = require('discord.js');

class Route extends BaseRoute {
	static path = '/api/clan/members';
	static methods = ['GET', 'POST', 'PATCH', 'DELETE'];
	static loginRequired = true;
	static memberRequired = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const member = await this.fetchMember(token);

		switch (request.method) {
			case 'GET': {
				Util.database.query('SELECT * FROM clan_member ORDER BY joined_at ASC').then(async (res) => {
					const data = await Promise.all(
						res.rows.map(async (member) => {
							if (member.user_id) member.discord_tag = (await Util.discord.users.fetch(member.user_id)).tag;
							return member;
						}),
					);
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.write(JSON.stringify(data));
					response.end();
				});
				break;
			}

			case 'POST': {
				if (
					!url.searchParams.has('username') ||
					!validateUsername(url.searchParams.get('username')) ||
					!url.searchParams.has('joined_at') ||
					!validateJoinedDate(url.searchParams.get('joined_at')) ||
					(url.searchParams.has('user_id') && !validateId(url.searchParams.get('user_id'))) ||
					!url.searchParams.has('rank') ||
					!validateRank(url.searchParams.get('rank'))
				) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				if (
					!member ||
					!member.discord.roles.cache.some(
						(r) => r.id === Util.config.LEADER_ROLE_ID || r.id === Util.config.CO_LEADER_ROLE_ID,
					)
				) {
					response.writeHead(401, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 401,
							message: 'Unauthorized Access',
						}),
					);
					return response.end();
				}

				await Util.database.query('INSERT INTO clan_member VALUES ($1, $2, $3, $4)', [
					url.searchParams.get('username'),
					`${url.searchParams.get('joined_at')}T12:00:00Z`,
					url.searchParams.get('user_id') ? url.searchParams.get('user_id') : null,
					url.searchParams.get('rank'),
				]);

				response.writeHead(200);
				response.end();

				sendUpdate(member.discord, request.method, url.searchParams);
				break;
			}

			case 'PATCH': {
				if (
					!url.searchParams.has('username') ||
					!validateUsername(url.searchParams.get('username')) ||
					!url.searchParams.has('joined_at') ||
					!validateJoinedDate(url.searchParams.get('joined_at')) ||
					(url.searchParams.has('user_id') && !validateId(url.searchParams.get('user_id'))) ||
					!url.searchParams.has('rank') ||
					!validateRank(url.searchParams.get('rank')) ||
					!url.searchParams.has('member') ||
					!validateUsername(url.searchParams.get('member'))
				) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				if (
					!member ||
					!member.discord.roles.cache.some(
						(r) => r.id === Util.config.LEADER_ROLE_ID || r.id === Util.config.CO_LEADER_ROLE_ID,
					)
				) {
					response.writeHead(401, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 401,
							message: 'Unauthorized Access',
						}),
					);
					return response.end();
				}

				await Util.database.query(
					'UPDATE clan_member SET username = $1, user_id = $2, joined_at = $3, rank = $4 WHERE username = $5',
					[
						url.searchParams.get('username'),
						url.searchParams.get('user_id') ? url.searchParams.get('user_id') : null,
						url.searchParams.get('joined_at'),
						url.searchParams.get('rank'),
						url.searchParams.get('member'),
					],
				);

				response.writeHead(200);
				response.end();

				sendUpdate(member.discord, request.method, url.searchParams);
				break;
			}

			case 'DELETE': {
				if (!url.searchParams.has('member') || !validateUsername(url.searchParams.get('member'))) {
					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Bad Request',
						}),
					);
					return response.end();
				}

				if (
					!member ||
					!member.discord.roles.cache.some(
						(r) => r.id === Util.config.LEADER_ROLE_ID || r.id === Util.config.CO_LEADER_ROLE_ID,
					)
				) {
					response.writeHead(401, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 401,
							message: 'Unauthorized Access',
						}),
					);
					return response.end();
				}

				await Util.database.query('DELETE FROM clan_member WHERE username = $1', [url.searchParams.get('member')]);

				response.writeHead(200);
				response.end();

				sendUpdate(member.discord, request.method, url.searchParams);
				break;
			}
		}
	}
}

function validateUsername(username) {
	const regex = /^\w[\w_]{2,13}$/i;
	return regex.test(username);
}

function validateJoinedDate(date) {
	const regex = /^[12]\d{3}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
	return regex.test(date);
}

function validateId(id) {
	const regex = /^\d{18}$/;
	return regex.test(id);
}

function validateRank(rank) {
	const regex = /^[123]$/;
	return regex.test(rank);
}

/**
 * @param {GuildMember} author
 * @param {string} method
 * @param {URLSearchParams} searchParams
 */
function sendUpdate(author, method, searchParams) {
	Util.discord.channels.cache
		.get('881512057822933044')
		.send(
			`
			__Dashboard updated:__
		 	- **By:** \`${author.user.tag} (${author.user.id})\`
		 	- **Method:** \`${method}\`
		 	- **Member:** \`${searchParams.get('member')}\`${
				method !== 'DELETE'
					? `
						>>> **Username:** \`${searchParams.get('username')}\`
						**Discord ID:** \`${searchParams.get('user_id')}\`
						**Joined at:** \`${searchParams.get('joined_at')}\`
						**Rank:** \`${['Member', 'Co-leader', 'Leader'][parseInt(searchParams.get('rank') - 1)]}\`
						`
					: ''
			}`.replace(/\t*/g, ''),
		)
		.catch(console.error);
}

module.exports = Route;
