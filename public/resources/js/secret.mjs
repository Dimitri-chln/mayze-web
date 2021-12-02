import { getCookie } from '../../modules/cookie.mjs'


fetch(`/api/discord/user?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(res => {
		if (res.status === 200) {
            const claimButton = document.getElementById('claim-button');
            claimButton.disabled = false;
            claimButton.style.cursor = 'auto';

        } else {
			sessionStorage.setItem('callback_location', location.href);
            location.href = '/login';
		}
	});

document.getElementById('claim-button').addEventListener('click', () => {
    fetch(`/api/secret?token=${getCookie('token')}`, {
        method: 'POST'
    })
        .then(res => {
            alert('La validation a bien été prise en compte');
        });
});