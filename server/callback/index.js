function generateClientToken() {
	if (!localStorage.getItem('mayze_user_token'))
		localStorage.setItem('mayze_user_token', generateRandomString());
}

function redirect() {
	const queryParams = new URLSearchParams(location.search);

	if (queryParams.has('code')) {
		const state = sessionStorage.getItem('state');
		const callback_state = queryParams.get('state');
		const code = queryParams.get('code');

		if (state !== atob(callback_state)) {
			return alert('Connexion refusée');
		}

		fetch(`/api/discord/token?code=${code}&user_token=${localStorage.getItem('mayze_user_token')}`, {
			method: 'POST'
		});

		location.href = sessionStorage.getItem('callback_location') || '/';

		sessionStorage.removeItem('state');
		sessionStorage.removeItem('callback_location');
	}
}

function forceRedirect() {
	location.href = sessionStorage.getItem('callback_location') || '/';

	sessionStorage.removeItem('state');
	sessionStorage.removeItem('callback_location');
}

function generateRandomString() {
	const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
	const rand = Math.floor(Math.random() * 10);
	let randStr = '';

	for (let i = 0; i < 40 + rand; i++) {
		randStr += charList.charAt(Math.floor(Math.random() * charList.length));
	}

	return randStr;
}