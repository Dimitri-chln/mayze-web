navigator.clipboard.writeText(
	new URLSearchParams(window.location.search).get('text')
)
	.then(() => {
		window.close();
	})
	.catch(err => {
		alert(err);
	});