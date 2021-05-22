import { getCookie } from '../../modules/cookie.mjs';

const queryParams = new URLSearchParams(location.search);

if (queryParams.has('code')) {
	const state = sessionStorage.getItem('state');
	const callback_state = queryParams.get('state');
	const code = queryParams.get('code');

	if (state !== atob(callback_state)) {
		alert('Connexion refusée');
	} else {

		fetch(`/api/discord/token?code=${code}&token=${getCookie('token')}`, {
			method: 'POST'
		})
			.then(async res => {
				if (res.status === 200) {
					location.href = sessionStorage.getItem('callback_location') || '/';
					sessionStorage.removeItem('state');
					sessionStorage.removeItem('callback_location');
				} else {
					let err = await res.json().catch(() => {});
					alert(`La connexion a échoué\n${err.status} ${err.message}`);
				}
			});
	}
}