import katex from 'https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs';

const inputElement = document.getElementById('katex-input');
const renderDiv = document.getElementById('katex-render');
const errorElement = document.getElementById('katex-error');
const editButton = document.getElementById('edit-button');
const downloadButton = document.getElementById('download-button');
const prefillData = new URLSearchParams(location.search).get('text');

let lastValidInput = inputElement.value;

if (prefillData) {
	editButton.style.display = 'block';
	inputElement.value = atob(prefillData);
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

downloadButton.addEventListener('click', () => {
	const a = document.createElement('a');
	a.href = `${location.origin}/math/preview${location.search}`;
	a.download = 'math.png';

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
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
		inputElement.value ? `${location.pathname}?text=${btoa(inputElement.value)}` : location.pathname,
	);
}
