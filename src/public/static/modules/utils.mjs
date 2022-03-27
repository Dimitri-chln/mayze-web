export function generateRandomString() {
	const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
	let randStr = '';

	for (let i = 0; i < 25; i++) {
		randStr += charList.charAt(Math.floor(Math.random() * charList.length));
	}

	return randStr;
}

/**
 * @param {string} date
 */
export function formatDate(date) {
	const months = [
		'janvier',
		'février',
		'mars',
		'avril',
		'mai',
		'juin',
		'juillet',
		'août',
		'septembre',
		'octobre',
		'novembre',
		'décembre',
	];

	let year = date.substring(0, 4);
	let month = months[parseInt(date.substring(5, 7)) - 1];
	let day = date.substring(8, 10);

	return `${day} ${month} ${year}`;
}

export function formatXP(xp) {
	const suffixes = ['', 'k', 'm', 'g'];

	while (xp > 1000) {
		suffixes.shift();
		xp = xp / 1000;
	}

	return `${Math.round(xp * 10) / 10 + suffixes[0]} XP`;
}

/**
 * @param {any[]} array
 */
export function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}
