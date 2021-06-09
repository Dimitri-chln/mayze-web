const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'logout',
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

		if (request.method.toUpperCase() !== 'POST' || !mayzeToken) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

        await pg.query(`DELETE FROM web_clients WHERE token = '${mayzeToken}'`);

        response.writeHead(200);
        response.end();
    }
};

module.exports = route;