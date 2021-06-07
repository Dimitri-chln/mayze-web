const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'logs',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
		if (request.method.toUpperCase() !== 'GET' || !request.headers.authorization || request.headers.authorization !== process.env.LOGS_AUTHORIZATION) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({
				status: 400,
				message: 'Bad Request'
			}));
			return response.end();
		}

        const { spawn } = require('child_process');
        const channel = discord.channels.cache.get('851532189598613555');

        const logs = spawn('heroku logs --app mayze --tail');

        logs.stdout.on('data', data => channel.send(`\`\`\`diff\n+ ${data}\n\`\`\``));
        logs.stderr.on('data', data => channel.send(`\`\`\`diff\n- ${data}\n\`\`\``));
        logs.on('error', error => channel.send(`\`\`\`diff\n- Error - ${error}\n\`\`\``));

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end();
	}
};

module.exports = route;