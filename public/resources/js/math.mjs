import katex from 'https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs';


const inputElement = document.getElementById('katex-input');
const renderDiv = document.getElementById('katex-render');

inputElement.addEventListener('input', () => {
	inputElement.style.height = '2em';
	inputElement.style.height = `${inputElement.scrollHeight}px`;
	katex.render(inputElement.value, renderDiv, {
		displayMode: true,
		throwOnError: false
	});
});