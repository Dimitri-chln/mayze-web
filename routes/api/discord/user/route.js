const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'user',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
        if (request.method.toUpperCase() !== 'GET' || !url.searchParams.get('token')) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
        }

        const { 'rows': tokens } = await pg.query(`SELECT discord_token FROM web_clients WHERE '${url.searchParams.get('token')}' = ANY (mayze_tokens)`);
        if (!tokens.length) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 401,
				message: 'Not Connected'
			}));
			return response.end();
        }

        const { discord_token } = tokens[0];

        Axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${discord_token}`
            }
        })
            .then(res => {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.write(JSON.stringify(res.data));
                response.end();
            })
            .catch(err => {
                console.error(err);

                response.writeHead(400, { 'Content-Type': 'text/html' });
                response.end('Error retrieving user');
            });
    }
};

module.exports = route;