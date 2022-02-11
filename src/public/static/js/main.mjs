import { getCookie } from '../modules/cookie.mjs';

const isMember = document.getElementById('is-member');
isMember.innerHTML = 'Connexion...';

fetch(`/api/discord/member?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	isMember.innerText =
		res.status === 200
			? '✨ Tu es membre de Mayze ! ✨'
			: "Tu n'es pas membre de Mayze";
});
