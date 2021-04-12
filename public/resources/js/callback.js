function forceRedirect() {
	location.href = sessionStorage.getItem('callback_location') || '/';

	sessionStorage.removeItem('state');
	sessionStorage.removeItem('callback_location');
}