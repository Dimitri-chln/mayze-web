export function generateRandomString() {
	const charList =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
	let randStr = '';

	for (let i = 0; i < 25; i++) {
		randStr += charList.charAt(Math.floor(Math.random() * charList.length));
	}

	return randStr;
}

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

	let year = date.substr(0, 4);
	let month = months[parseInt(date.substr(5, 2)) - 1];
	let day = date.substr(8, 2);

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
