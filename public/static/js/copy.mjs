navigator.clipboard
	.writeText(new URLSearchParams(window.location.search).get('text'))
	.then(() => {
		window.close();
	})
	.catch(() => {
		window.close();
	});
