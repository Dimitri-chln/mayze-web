import katex from 'https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs';

const inputElement = document.getElementById('katex-input');
const renderDiv = document.getElementById('katex-render');
const editButton = document.getElementById('edit-button');
const prefilledData = new URLSearchParams(location.search).get('prefill');

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

	katex.render(inputElement.value, renderDiv, {
		displayMode: true,
		throwOnError: false,
	});

	history.replaceState(
		null,
		null,
		inputElement.value ? `${location.pathname}?prefill=${btoa(inputElement.value)}` : location.pathname,
	);
}
