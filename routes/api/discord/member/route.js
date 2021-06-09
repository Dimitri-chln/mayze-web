const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'member',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
        const mayzeToken = url.searchParams.get('token') || token;

		if (request.method.toUpperCase() !== 'GET' || !mayzeToken) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

		const { 'rows': tokens } = await pg.query(`SELECT user_id FROM web_clients WHERE token = '${mayzeToken}'`);
		if (!tokens.length) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 401,
				message: 'Not Connected'
			}));
			return response.end();
		}

        const userID = tokens[0].user_id;
        const guild = discord.guilds.cache.get('689164798264606784');
        const member = guild.members.cache.get(userID);
		const JSONMember = member.toJSON();
		JSONMember.roles = member.roles.cache.toJSON();
        
        if (member && member.roles.cache.has('689169027922526235')) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify(JSONMember));
            response.end();
        } else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 404,
				message: 'Not A Member'
			}));
			return response.end();
        }
    }
};

module.exports = route;