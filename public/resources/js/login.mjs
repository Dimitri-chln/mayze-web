import { getCookie } from '../../modules/cookie.mjs';
import { generateRandomString } from '../../modules/utils.mjs';

fetch(`/api/discord/user?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(res => {
		if (res.status === 200) location.href = '/';
		else {
			const randStr = generateRandomString();
			sessionStorage.setItem('state', randStr);
			sessionStorage.setItem('callback_location', '/');
			location.href = `https://discord.com/api/oauth2/authorize?client_id=703161067982946334&redirect_uri=${encodeURIComponent(`${location.origin}/callback`)}&state=${btoa(randStr)}&response_type=code&scope=identify`;
		}
	});