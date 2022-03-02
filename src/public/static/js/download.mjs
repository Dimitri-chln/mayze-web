const searchParams = new URLSearchParams(location.search);

if (searchParams.has('url')) {
	document.getElementById('download-form-url').value = searchParams.get('url');
}

document
	.getElementById('download-form-submit')
	.addEventListener('click', (event) => {
		event.preventDefault();

		
	});
