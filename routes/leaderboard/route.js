const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;
const Axios = require('axios').default;

const route = {
	name: 'leaderboard',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
		if (request.method.toUpperCase() !== 'GET') {
			response.writeHead(400, { 'Content-Type': 'text/html' });
			return response.end('400 Bad Request');
		}

		Axios.get(`${process.env.URL}/api/discord/member?token=${token}`)
			.then(async res => {
				const file = await Fs.readFile('./routes/leaderboard/index.html');
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.write(file);
				response.end();
			})
			.catch(async err => {
				const file = await Fs.readFile('./public/resources/html/unauthorized.html');
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.write(file);
				return response.end();
			});
	}
};

module.exports = route;