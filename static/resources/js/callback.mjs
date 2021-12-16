import { getCookie } from '../../modules/cookie.mjs';


const queryParams = new URLSearchParams(location.search);

if (queryParams.has('code')) {
	const state = sessionStorage.getItem('state');
	const callback_state = queryParams.get('state');
	const code = queryParams.get('code');

	if (state !== callback_state) {
		alert('Connexion refusée');
	} else {

		fetch(`/api/discord/login?code=${code}&token=${getCookie('token')}`, {
			method: 'POST'
		})
			.then(async res => {
				sessionStorage.removeItem('state');
				
				if (res.status === 200) {
					const callbackLocation = sessionStorage.getItem('callback_location');
					if (callbackLocation) sessionStorage.removeItem('callback_loaction');
					location.href = callbackLocation ?? '/';
				
				} else {
					let err = await res.json();
					alert(`La connexion a échoué\n${err.status} ${err.message}`);
				}
			});
	}
}

document.getElementById('redirect-button').addEventListener('click', () => {
	sessionStorage.removeItem('state');
	sessionStorage.removeItem('callback_location');
	location.href = sessionStorage.getItem('callback_location') ?? '/';
});