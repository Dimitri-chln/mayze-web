import { getCookie } from '../modules/cookie.mjs';
import Rack from '../modules/rack.mjs';
import { shuffle } from '../modules/utils.mjs';

const htmlRack = document.getElementById('rack');
const scoresTable = document.getElementById('scores');
const restartButton = document.getElementById('restart-button');
const rack = new Rack();

const modeSelector = document
	.getElementById('mode-selector')
	.children.item(0)
	.children.item(0);

modeSelector.checked =
	new URLSearchParams(location.search).get('train') == 'true';

scoresTable.style.opacity = modeSelector.checked ? '0' : '1';

const trainingColor = document.getElementById('training-color');

if (modeSelector.checked) {
	const randomPlayer = Math.ceil(Math.random() * 2);
	trainingColor.innerHTML = randomPlayer === 1 ? 'rouge' : 'jaune';
	trainingColor.style.color = randomPlayer === 1 ? 'red' : 'yellow';
} else {
	trainingColor.innerHTML = '';
}

const trainingPlayer = () =>
	trainingColor.innerHTML === 'rouge'
		? 1
		: trainingColor.innerHTML === 'jaune'
		? 2
		: null;

modeSelector.addEventListener('change', () => {
	scoresTable.style.opacity = modeSelector.checked ? '0' : '1';

	history.replaceState(
		null,
		null,
		`${location.pathname}?train=${modeSelector.checked}`,
	);

	if (modeSelector.checked) {
		trainingColor.innerHTML = rack.player === 1 ? 'rouge' : 'jaune';
		trainingColor.style.color = rack.player === 1 ? 'red' : 'yellow';
	} else {
		trainingColor.innerHTML = '';
	}
});

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

				// Let the AI play if training mode is enabled
				if (modeSelector.checked && rack.player !== trainingPlayer()) {
					const bestColumnIndex = body.scores.indexOf(
						Math.max(...body.scores.map((s) => s ?? -1000)),
					);

					const badColumnIndex =
						shuffle(
							body.scores
								.map((score, index) => {
									return { score, index };
								})
								.filter(
									(column) =>
										column.score !==
											Math.max(...body.scores.map((s) => s ?? -1_000)) &&
										// Do not play a move that would make the AI instantly lose
										column.score !==
											Math.floor((-42 + body.positions.length) / 2),
								),
						)[0]?.index ?? body.scores.findIndex((score) => score);

					// 20% chance to play a bad move
					const finalColumnIndex =
						Math.random() < 0.2 ? badColumnIndex : bestColumnIndex;

					const finalColumn = htmlRack.children
						.item(0)
						.children.item(finalColumnIndex);

					finalColumn.click();
				}
			});
		} catch (err) {
			console.error(err);
		}
	});
}

if (trainingPlayer() === 2) {
	const bestColumn = htmlRack.children.item(0).children.item(3);
	bestColumn.click();
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
