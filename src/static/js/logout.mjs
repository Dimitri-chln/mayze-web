import { getCookie } from '../../modules/cookie.mjs';

fetch(`/api/discord/logout?token=${getCookie('token')}`, {
	method: 'POST',
}).then((res) => {
	location.href = '/';
});

document
	.getElementById('redirect-button')
	.addEventListener('click', () => (location.href = '/'));