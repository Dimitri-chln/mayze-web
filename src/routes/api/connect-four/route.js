const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const Fs = require('fs');
const BrainJS = require('brain.js');

class Route extends BaseRoute {
	static path = '/api/connect-four';
	static methods = ['POST'];
	static requireLogin = true;
	static requireMember = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		token = url.searchParams.get('token') || token;

		const member = await this.fetchMember(token);

		const buffers = [];

		for await (const chunk of request) {
			buffers.push(chunk);
		}

		const data = JSON.parse(Buffer.concat(buffers).toString());

		const transformedRack = data.rack
			.flat()
			.map((cell) => {
				return [Number(cell === 0), Number(cell === 1), Number(cell === 2)];
			})
			.flat();

		await Util.database.query(
			'INSERT INTO connect_four (user_id, rack, played) VALUES ($1, $2, $3)',
			[member.discord.user.id, transformedRack, data.played],
		);

		const output = Util.connectFour.net.run(
			data.new_rack
				.flat()
				.map((cell) => {
					return [Number(cell === 0), Number(cell === 1), Number(cell === 2)];
				})
				.flat(),
		);

		const columns = Array.from(Array(7), (_, i) => i);

		const bestColumns = columns.filter(
			(columnIndex) =>
				data.new_rack[columnIndex][5] === 0 &&
				output[columnIndex] === Math.max(...output),
		);

		const bestColumn =
			bestColumns[Math.floor(Math.random() * bestColumns.length)] ||
			Math.floor(Math.random() * 7);

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(JSON.stringify(bestColumn));
		response.end();

		// Train the Connect 4 AI
		if (!Util.connectFour.training) {
			Util.connectFour.training = true;
			console.log('Training Connect 4 AI...');

			// Create a simple feed forward neural network with backpropagation
			const trainNet = new BrainJS.NeuralNetwork(Util.connectFour.config);

			const { rows: trainData } = await Util.database.query(
				'SELECT * FROM connect_four',
			);

			await trainNet.trainAsync(
				trainData.map((d) => {
					return {
						input: d.rack,
						output: Array.from(Array(7), (_, i) => Number(i === d.played)),
					};
				}),
			);

			Fs.writeFileSync(
				`./src/assets/connect-four.json`,
				JSON.stringify(trainNet.toJSON(), null, 2),
			);

			console.log('Finished training Connect 4 AI');
			Util.connectFour.training = false;
		}
	}
}

module.exports = Route;
