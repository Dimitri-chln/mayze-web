import katex from 'https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs';

const inputElement = document.getElementById('katex-input');
const renderDiv = document.getElementById('katex-render');
const errorElement = document.getElementById('katex-error');
const editButton = document.getElementById('edit-button');
const prefilledData = new URLSearchParams(location.search).get('prefill');

let lastValidInput = inputElement.value;

if (prefilledData) {
	editButton.style.display = 'block';
	inputElement.value = atob(prefilledData);
	renderLaTeX();
} else {
	inputElement.style.display = 'block';
}

inputElement.addEventListener('input', renderLaTeX);

editButton.addEventListener('click', () => {
	editButton.style.display = 'none';
	inputElement.style.display = 'block';
	renderLaTeX();
});

function renderLaTeX() {
	inputElement.style.height = '2em';
	inputElement.style.height = `${inputElement.scrollHeight}px`;

	try {
		katex.render(inputElement.value, renderDiv, {
			displayMode: true,
			throwOnError: true,
		});

		lastValidInput = inputElement.value;
		errorElement.innerHTML = null;
	} catch (err) {
		katex.render(lastValidInput, renderDiv, {
			displayMode: true,
			throwOnError: true,
		});

		errorElement.innerHTML = err;
	}

	history.replaceState(
		null,
		null,
		inputElement.value ? `${location.pathname}?prefill=${btoa(inputElement.value)}` : location.pathname,
	);
}
