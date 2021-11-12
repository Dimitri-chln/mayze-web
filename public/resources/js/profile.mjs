import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/discord/user?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const discordUser = await res.json().catch(() => {});

        document.getElementById('member-title').firstElementChild.innerHTML = discordUser.username;
    });