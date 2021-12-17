import { getCookie } from '../../modules/cookie.mjs';


document.getElementById('claim-button').addEventListener('click', () => {
	fetch(`/api/secret?token=${getCookie('token')}`, {
		method: 'POST'
	})
		.then(res => {
			if (res.status === 200) alert('La validation a bien été prise en compte');
			else alert('Une erreur est survenue en réclamant la récompense')
		});
});