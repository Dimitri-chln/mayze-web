import { getCookie } from '../modules/cookie.mjs';
import Rack from '../modules/rack.mjs';

const htmlRack = document.getElementById('rack').children.item(0);
const restartButton = document.getElementById('restart-button');
const rack = new Rack();

for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
	const column = htmlRack.appendChild(document.createElement('tr'));

	for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
		column.appendChild(document.createElement('td'));
	}

	column.addEventListener('click', () => {
		if (!rack.playable) return;

		try {
			const winner = rack.play(columnIndex);
			updateHtmlRack(winner);
			if (winner) return;

			setTimeout(() => {
				const winner = rack.bot(Math.floor(Math.random() * 7));
				updateHtmlRack(winner);
			}, 500);
		} catch (err) {
			console.error(err);
		}
	});
}

function updateHtmlRack(winner) {
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 6; j++) {
			htmlRack.children.item(i).children.item(5 - j).innerHTML =
				rack.data[i][j] === 1
					? '<img src="static/images/connect-4-red.png" alt="Red" />'
					: rack.data[i][j] === 2
					? '<img src="static/images/connect-4-yellow.png" alt="Yellow" />'
					: '';
		}
	}

	if (winner) {
		document.getElementById('win-text').innerHTML = `${
			winner === 1 ? 'Rouge' : 'Jaune'
		} a gagné !`;

		restartButton.style.display = 'block';
	}
}

restartButton.addEventListener('click', () => {
	location.reload();
});