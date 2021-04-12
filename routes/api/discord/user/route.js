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
	 */
	run: async (url, request, response, discord, pg) => {
        if (request.method.toUpperCase() !== 'GET' || !url.searchParams.get('user_token')) {
            response.writeHead(400, { 'Content-Type': 'text/html' });
            return response.end('400 Bad Request');
        }

        const { 'rows': tokens } = await pg.query(`SELECT discord_token FROM web_clients WHERE '${url.searchParams.get('user_token')}' = ANY (mayze_tokens)`);
        if (!tokens.length) {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            return response.end('404 Not Connected');
        }

        const token = tokens[0].discord_token;

        Axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`
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