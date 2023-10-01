navigator.clipboard.writeText(new URLSearchParams(window.location.search).get('text')).finally(() => {
	window.close();
});
