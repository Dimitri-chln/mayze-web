import { getCookie } from '../modules/cookie.mjs';
import Rack from '../modules/rack.mjs';
import { shuffle } from '../modules/utils.mjs';

const htmlRack = document.getElementById('rack');
const scoresTable = document.getElementById('scores');
const restartButton = document.getElementById('restart-button');
const statsButton = document.getElementById('stats-button');
const rack = new Rack();

const trainingMode = document.getElementById('training-switch');
const modeSelector = document.getElementById('mode-selector');
const badMoveRate = document.getElementById('bad-move-rate');

trainingMode.checked = new URLSearchParams(location.search).get('train') == 'true';
modeSelector.value = new URLSearchParams(location.search).get('mode') ?? modeSelector.value;
badMoveRate.value = new URLSearchParams(location.search).get('bad_move') ?? badMoveRate.value;

const trainingColor = document.getElementById('training-color');
const badMoveRateText = document.getElementById('bad-move-rate-text');

// Initialize the mode
scoresTable.style.opacity = trainingMode.checked ? '0' : '1';

if (trainingMode.checked) {
	const randomPlayer = Math.ceil(Math.random() * 2);
	trainingColor.innerHTML = randomPlayer === 1 ? 'rouge' : 'jaune';
	trainingColor.style.color = randomPlayer === 1 ? 'red' : 'yellow';
} else {
	trainingColor.innerHTML = '';
}

// Initialize the mode
if (modeSelector.value === 'progress' || modeSelector.value === 'random') {
	badMoveRate.disabled = true;
}

// Initialize the bad play rate text
badMoveRateText.innerHTML = badMoveRate.value;

const trainingPlayer = () => (trainingColor.innerHTML === 'rouge' ? 1 : trainingColor.innerHTML === 'jaune' ? 2 : null);

trainingMode.addEventListener('change', () => {
	history.replaceState(
		null,
		null,
		`${location.pathname}?train=${trainingMode.checked}&mode=${modeSelector.value}&bad_move=${badMoveRate.value}`,
	);

	scoresTable.style.opacity = trainingMode.checked ? '0' : '1';

	if (trainingMode.checked) {
		trainingColor.innerHTML = rack.player === 1 ? 'rouge' : 'jaune';
		trainingColor.style.color = rack.player === 1 ? 'red' : 'yellow';
	} else {
		trainingColor.innerHTML = '';
	}
});

modeSelector.addEventListener('change', () => {
	history.replaceState(
		null,
		null,
		`${location.pathname}?train=${trainingMode.checked}&mode=${modeSelector.value}&bad_move=${badMoveRate.value}`,
	);

	badMoveRate.disabled = modeSelector.value === 'progress' || modeSelector.value === 'random';
});

badMoveRate.addEventListener('change', () => {
	history.replaceState(
		null,
		null,
		`${location.pathname}?train=${trainingMode.checked}&mode=${modeSelector.value}&bad_move=${badMoveRate.value}`,
	);

	badMoveRateText.innerHTML = badMoveRate.value;
});

for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
	const column = htmlRack.children.item(0).appendChild(document.createElement('tr'));

	scoresTable.children.item(0).children.item(0).appendChild(document.createElement('td'));

	for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
		column.appendChild(document.createElement('td'));
	}

	column.addEventListener('click', () => {
		try {
			if (!rack.playable) return;

			const winner = rack.play(columnIndex);
			rack.playable = false;
			updateHtmlRack(columnIndex, winner);

			if (winner) {
				if (!trainingPlayer()) return;

				return fetch(
					`/api/connect-four?token=${getCookie('token')}&result=${
						winner === trainingPlayer() ? 'win' : winner === -1 ? 'draw' : 'defeat'
					}&difficulty=${badMoveRate.value}`,
					{
						method: 'POST',
					},
				);
			}

			document.getElementById('loading').style.display = 'inline-block';

			fetch(`/api/connect-four?token=${getCookie('token')}&positions=${rack.positions.join('')}`, {
				method: 'GET',
			}).then(async (res) => {
				const body = await res.json();

				document.getElementById('loading').style.display = 'none';

				for (let i = 0; i < body.scores.length; i++) {
					const scoreCell = scoresTable.children.item(0).children.item(0).children.item(i);

					scoreCell.innerHTML = body.scores[i];
					scoreCell.style.color = body.scores[i] > 0 ? '#46e083' : body.scores[i] < 0 ? '#e32817' : '#f2b933';
				}

				rack.playable = true;

				// Let the AI play if training mode is enabled
				if (trainingMode.checked && rack.player !== trainingPlayer()) {
					const bestColumnIndex = body.scores.indexOf(Math.max(...body.scores.map((s) => s ?? -1000)));

					const shuffledScores = shuffle(
						body.scores.map((score, index) => {
							return { score, index };
						}),
					);

					const badColumnIndex =
						// Check if the AI can win in 1 move
						shuffledScores.find((column) => column.score === rack.movesLeft)?.index ??
						// Otherwise choose a move that won't make the opponent win in 1 move
						shuffledScores.find((column) => column.score && column.score !== -rack.movesLeft)?.index ??
						// Otherwise play in any column that is not full
						shuffledScores.find((column) => column.score)?.index;

					const finalColumnIndex = Math.random() < badMoveRate.value / 100 ? badColumnIndex : bestColumnIndex;
					const finalColumn = htmlRack.children.item(0).children.item(finalColumnIndex);
					finalColumn.click();
				}
			});
		} catch (err) {
			console.error(err);
		}
	});
}

if (trainingPlayer() === 2) {
	const firstColumnIndex = Math.random() < badMoveRate.value / 100 ? Math.floor(Math.random() * 7) : 3;
	const firstColumn = htmlRack.children.item(0).children.item(firstColumnIndex);

	firstColumn.click();
}

/**
 * @param {number} played
 * @param {number} winner
 */
function updateHtmlRack(played, winner) {
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 6; j++) {
			htmlRack.children
				.item(0)
				.children.item(i)
				.children.item(5 - j).innerHTML =
				rack.data[i][j] === 1
					? `<div class="red${i === played && !rack.data[i][j + 1] ? ' last-played' : ''}"></div>`
					: rack.data[i][j] === 2
					? `<div class="yellow${i === played && !rack.data[i][j + 1] ? ' last-played' : ''}"></div>`
					: '';
		}
	}

	if (winner) {
		if (winner === -1) document.getElementById('win-text').innerHTML = 'Égalité !';
		else document.getElementById('win-text').innerHTML = `${winner === 1 ? 'Rouge' : 'Jaune'} a gagné !`;

		restartButton.style.display = 'block';

		if (!trainingPlayer()) return;

		badMoveRate.disabled = false;
		switch (modeSelector.value) {
			case 'standard':
				break;
			case 'progress':
				badMoveRate.value =
					winner === trainingPlayer()
						? Math.max(badMoveRate.value - 5, 0)
						: winner === -1
						? badMoveRate.value
						: Math.min(badMoveRate.value + 5, 100);
				break;
			case 'random':
				badMoveRate.value = Math.floor(Math.random() * 21) * 5;
				break;
		}
		badMoveRate.disabled = true;
	}
}

restartButton.addEventListener('click', () => {
	location.reload();
});

statsButton.addEventListener('click', () => {
	location.href = '/games/connect-4/stats';
});
