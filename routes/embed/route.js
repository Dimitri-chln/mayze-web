const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');
const Fs = require('fs').promises;

const route = {
	name: 'embed',
	/**
	 * @param {URL} url 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 * @param {string} token
	 */
	run: async (url, request, response, discord, pg, token) => {
		
		let html = '<!DOCTYPE html><html prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8" /><meta property="og:type" content="website" />';
		
		if (url.searchParams.toString()) {
			if (url.searchParams.get('color')) html += `<meta name="theme-color" content="#${url.searchParams.get('color')}" />`;
			if (url.searchParams.get('title')) html += `<meta property="og:title" content="${url.searchParams.get('title')}" />`;
			if (url.searchParams.get('description')) html += `<meta property="og:description" content="${url.searchParams.get('description')}" />`;
			if (url.searchParams.get('thumbnail')) html += `<meta property="og:image" content="${url.searchParams.get('thumbnail')}" />`;
			if (url.searchParams.get('image')) html += `<meta property="og:image" content="${url.searchParams.get('image')}" /><meta name="twitter:card" content="summary_large_image" />`;
		}
			
		html += "</head></html>";

		response.writeHead(200, { 'Content-Type': 'text/html '});
		response.write(html);
		response.end();
	}
};

module.exports = route;