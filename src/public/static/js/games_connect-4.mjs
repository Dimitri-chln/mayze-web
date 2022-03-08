import { getCookie } from '../modules/cookie.mjs';
import Rack from '../modules/rack.mjs';

const htmlRack = document.getElementById('rack');
const scoresTable = document.getElementById('scores');
const restartButton = document.getElementById('restart-button');
const rack = new Rack();

for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
	const column = htmlRack.children
		.item(0)
		.appendChild(document.createElement('tr'));

	scoresTable.children
		.item(0)
		.children.item(0)
		.appendChild(document.createElement('td'));

	for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
		column.appendChild(document.createElement('td'));
	}

	column.addEventListener('click', () => {
		try {
			if (!rack.playable) return;

			const winner = rack.play(columnIndex);
			rack.playable = false;
			updateHtmlRack(winner);
			if (winner) return;

			document.getElementById('loading').style.display = 'inline-block';

			fetch(
				`/api/connect-four?token=${getCookie(
					'token',
				)}&positions=${rack.positions.join('')}`,
				{
					method: 'GET',
				},
			).then(async (res) => {
				const body = await res.json();

				document.getElementById('loading').style.display = 'none';

				for (let i = 0; i < body.scores.length; i++) {
					const scoreCell = scoresTable.children
						.item(0)
						.children.item(0)
						.children.item(i);

					scoreCell.innerHTML = body.scores[i];
					scoreCell.style.color =
						body.scores[i] > 0
							? '#46e083'
							: body.scores[i] < 0
							? '#e32817'
							: '#f2b933';
				}

				rack.playable = true;
			});
		} catch (err) {
			console.error(err);
		}
	});
}

function updateHtmlRack(winner) {
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 6; j++) {
			htmlRack.children
				.item(0)
				.children.item(i)
				.children.item(5 - j).innerHTML =
				rack.data[i][j] === 1
					? '<div class="red"></div>'
					: rack.data[i][j] === 2
					? '<div class="yellow"></div>'
					: '';
		}
	}

	if (winner) {
		if (winner === -1)
			document.getElementById('win-text').innerHTML = 'Égalité !';
		else
			document.getElementById('win-text').innerHTML = `${
				winner === 1 ? 'Rouge' : 'Jaune'
			} a gagné !`;

		restartButton.style.display = 'block';
	}
}

restartButton.addEventListener('click', () => {
	location.reload();
});
