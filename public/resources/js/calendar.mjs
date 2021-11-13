/**@param {string} day */
const getISO = (day) => `2021-11-${day.padStart(2, '0')}T00:00:00Z`;

/**@type {Map<string, HTMLElement>} */
const calendar = new Map();

for (const row of document.getElementById('calendar-body').rows) {
	for (const cell of row.cells) {
		if (cell.innerHTML) calendar.set(cell.innerHTML, cell);
	}
}

for (const [ day, cell ] of calendar) {
	const date = new Date(getISO(day));
	const now = new Date();

	if (date.getUTCFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
		if (date.getUTCDate() < now.getUTCDate())
			cell.classList.add('passed-day');
		if (date.getUTCDate() === now.getUTCDate())
			cell.classList.add('current-day');
	}
}