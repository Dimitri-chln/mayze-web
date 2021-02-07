import { generateClientToken } from '../modules/utils.mjs';

generateClientToken();

fetch(`/api/discord/logout?user_token=${localStorage.getItem('mayze_user_token')}`, {
		method: 'POST'
})
    .then(res => {
		location.href = '/';
	});