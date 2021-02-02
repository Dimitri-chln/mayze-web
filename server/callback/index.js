function redirectHome() {
	const queryParams = new URLSearchParams(location.search);

	if (queryParams.has('code')) {
		const state = sessionStorage.getItem('state');
		const callback_state = queryParams.get('state');
		const code = queryParams.get('code');

		if (state !== atob(callback_state)) {
			return alert('Connexion refusée');
		}

		const data = {
			client_id: '703161067982946334',
			client_secret: '',
			grant_type: 'authorization_code',
			redirect_uri: 'https://mayze-v2.herokuapp.com/callback',
			code: code,
			scope: 'identify guilds',
		};

		fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams(data),
			headers: {
				'Content-type': 'application/x-www-form-urlencoded'
			}
		})
			.then(res => res.json())
			.then(console.log);
	}

	// location.href = sessionStorage.getItem('callback_location') || '/';

	sessionStorage.removeItem('state');
	sessionStorage.removeItem('callback_location');
}