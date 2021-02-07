import { generateClientToken } from '../modules/utils.mjs';

generateClientToken();
redirect();

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
		}).then(res => {
			if (res.status === 200) {
				location.href = sessionStorage.getItem('callback_location') || '/';
				sessionStorage.removeItem('state');
				sessionStorage.removeItem('callback_location');
			} else return alert('La connexion a échoué');
		});
	}
}