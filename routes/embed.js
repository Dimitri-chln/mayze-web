const { IncomingMessage, ServerResponse } = require('http');
const { UrlWithParsedQuery } = require('url');
const Pg = require('pg');
const Discord = require('discord.js');

const route = {
	name: 'embed',
	/**
	 * @param {UrlWithParsedQuery} url 
	 * @param {string[]} slashes 
	 * @param {IncomingMessage} request 
	 * @param {ServerResponse} response 
	 * @param {Discord.Client} discord 
	 * @param {Pg.Client} pg 
	 */
	exec: async (url, slashes, request, response, discord, pg) => {
		
		switch (slashes[1]) {
			// Default
			default:
				let html = '<!DOCTYPE html><html prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8" /><meta property="og:type" content="website" />';

				if (url.query.color) html += `<meta name="theme-color" content="#${url.query.color}" />`;
				if (url.query.title) html += `<meta property="og:title" content="${url.query.title}" />`;
				if (url.query.description) html += `<meta property="og:description" content="${url.query.description}"`;
				if (url.query.thumbnail || url.query.image) html += `<meta property="og:image" content="${url.query.thumbnail || url.query.image}" />`;
				if (url.query.image) html += `<meta name="twitter:card" content="summary_large_image" />`;
				
				html += "</head></html>";

				response.writeHead(200, { 'Content-Type': 'text/html '});
				response.write(html);
				response.end();
		}
	}
};

module.exports = route;