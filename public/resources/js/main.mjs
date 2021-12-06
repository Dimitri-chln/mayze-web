import { getCookie } from '../../modules/cookie.mjs'


const isMember = document.getElementById('is-member');
isMember.innerHTML = 'Connexion...';

fetch(`/api/discord/member?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const member = await res.json();

		if (member.userID) {
			isMember.innerText = '✨ Tu es membre de Mayze ! ✨';
		} else {
			isMember.innerText = 'Tu n\'es pas membre de Mayze';
		}
	});