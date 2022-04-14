import katex from 'https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs';

const inputElement = document.getElementById('katex-input-field');
const renderDiv = document.getElementById('katex-render');
const prefilledData = new URLSearchParams(location.search).get('prefill');

if (prefilledData) {
	inputElement.value = atob(prefilledData);
	updateRender();
}

inputElement.addEventListener('input', updateRender);

function updateRender() {
	inputElement.style.height = '2em';
	inputElement.style.height = `${inputElement.scrollHeight}px`;

	katex.render(inputElement.value, renderDiv, {
		displayMode: true,
		throwOnError: false,
	});

	history.replaceState(null, null, `${location.pathname}?prefill=${btoa(inputElement.value)}`);
}
