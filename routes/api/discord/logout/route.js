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
        if (request.method.toUpperCase() !== 'POST' || !url.searchParams.has('token')) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
        }

        const { 'rows': tokens } = await pg.query(`SELECT mayze_tokens FROM web_clients WHERE '${url.searchParams.get('token')}' = ANY (mayze_tokens)`);
        
        if (tokens.length > 1)
            await pg.query(`UPDATE web_clients SET mayze_tokens = '{ "${tokens[0].mayze_tokens.filter(t => t !== url.searchParams.get('token')).join('", "')}" }' WHERE '${url.searchParams.get('token')}' = ANY (mayze_tokens)`);
        else if (tokens.length === 1)
            await pg.query(`DELETE FROM web_clients WHERE '${url.searchParams.get('token')}' = ANY (mayze_tokens)`);

        response.writeHead(200);
        response.end();
    }
};

module.exports = route;