export default class Rack {
	/**
	 * @type {number[][]}
	 * */
	#data;
	/**
	 * @type {number[]}
	 */
	#row;
	/**
	 * @type {1 | 2}
	 */
	#player;
	/**
	 * @type {1 | 2}
	 */
	#winner;
	/**
	 * @type {boolean}
	 */
	#playable;
	/**
	 * @type {number[]}
	 */
	#positions;

	constructor() {
		this.#data = [];
		this.#row = [];
		this.#player = 1;
		this.#winner = null;
		this.#playable = true;
		this.#positions = [];

		for (let column = 0; column < 7; column++) {
			this.#data[column] = [];
			this.#row[column] = 0;

			for (let row = 0; row < 6; row++) {
				this.#data[column][row] = 0;
			}
		}
	}

	/**
	 * Each array represents one column
	 * => The rack is rotated 90° clockwise
	 */
	get data() {
		return this.#data;
	}

	get row() {
		return this.#row;
	}

	get player() {
		return this.#player;
	}

	get winner() {
		return this.#winner;
	}

	get playable() {
		return this.#playable;
	}

	set playable(value) {
		this.#playable = value;
	}

	get positions() {
		return this.#positions;
	}

	/**
	 * @param {number} column The column number
	 * @returns {?number} The eventual winner
	 */
	play(column) {
		if (this.winner) throw new Error('Game is over');
		const row = this.row[column];
		if (!this.playable) throw new Error('Game is not currently playable');
		if (row >= 6) throw new Error('Column is filled');

		this.#data[column][row] = this.player;
		this.#row[column]++;
		this.#player = this.player === 1 ? 2 : 1;
		this.#positions.push(column + 1);
		this.#winner = this.check();

		return this.winner;
	}

	/**
	 * Check if someone won
	 * @returns {?number} The eventual winner
	 */
	check() {
		const checkLine = (a, b, c, d) =>
			// Verify that the first cell non-zero and all cells match
			a !== 0 && a == b && a == c && a == d;

		// Check going up
		for (let c = 0; c < 7; c++)
			for (let r = 0; r < 3; r++)
				if (
					checkLine(
						this.data[c][r],
						this.data[c][r + 1],
						this.data[c][r + 2],
						this.data[c][r + 3],
					)
				)
					return this.data[c][r];

		// Check going right
		for (let c = 0; c < 4; c++)
			for (let r = 0; r < 6; r++)
				if (
					checkLine(
						this.data[c][r],
						this.data[c + 1][r],
						this.data[c + 2][r],
						this.data[c + 3][r],
					)
				)
					return this.data[c][r];

		// Check going up-right
		for (let c = 0; c < 4; c++)
			for (let r = 0; r < 3; r++)
				if (
					checkLine(
						this.data[c][r],
						this.data[c + 1][r + 1],
						this.data[c + 2][r + 2],
						this.data[c + 3][r + 3],
					)
				)
					return this.data[c][r];

		// Check going up-left
		for (let c = 0; c < 4; c++)
			for (let r = 3; r < 6; r++)
				if (
					checkLine(
						this.data[c][r],
						this.data[c + 1][r - 1],
						this.data[c + 2][r - 2],
						this.data[c + 3][r - 3],
					)
				)
					return this.data[c][r];
	}

	display() {
		let output = '';

		for (let row = 5; row >= 0; row--) {
			for (let column = 0; column < 7; column++) {
				output +=
					this.#data[column][row] === 1
						? ' O '
						: this.#data[column][row] === 2
						? ' X '
						: ' . ';
			}

			output += '\n';
		}

		return output;
	}
}
