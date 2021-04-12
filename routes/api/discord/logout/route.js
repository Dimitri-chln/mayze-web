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
	 */
	run: async (url, request, response, discord, pg) => {
        if (request.method.toUpperCase() !== 'POST' || !url.searchParams.get('user_token')) {
            response.writeHead(400, { 'Content-Type': 'text/html' });
            return response.end('400 Bad Request');
        }

        const { 'rows': tokens } = await pg.query(`SELECT mayze_tokens FROM web_clients WHERE '${url.searchParams.get('user_token')}' = ANY (mayze_tokens)`);
        
        if (tokens.length > 1)
            await pg.query(`UPDATE web_clients SET mayze_tokens = '{ "${tokens[0].mayze_tokens.filter(t => t !== url.searchParams.get('user_token')).join('", "')}" }' WHERE '${url.searchParams.get('user_token')}' = ANY (mayze_tokens)`);
        else if (tokens.length === 1)
            await pg.query(`DELETE FROM web_clients WHERE '${url.searchParams.get('user_token')}' = ANY (mayze_tokens)`);

        response.writeHead(200);
        response.end();
    }
};

module.exports = route;