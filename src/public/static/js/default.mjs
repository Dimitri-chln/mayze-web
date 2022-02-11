import { getCookie } from '../modules/cookie.mjs';

fetch(`/api/discord/user?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const user = await res.json();
	if (!user.id) return;

	console.log('Logged in');
	const loginButton = document.getElementById('login-button');
	loginButton.disabled = true;
	loginButton.style.cursor = 'not-allowed';
	loginButton.value = '  Connecté  ';

	const avatarImage = document.createElement('img');
	avatarImage.id = 'banner-user-avatar';
	avatarImage.alt = 'User avatar';
	avatarImage.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

	const parent = document.getElementById('banner-login');
	parent.prepend(avatarImage);
});

document.getElementById('login-button').addEventListener('click', () => {
	location.href = `/login?redirect=${location.pathname}`;
});

if (screen.width < 768) {
	for (let category of document.getElementsByClassName('banner-category')) {
		category.addEventListener('click', () => {
			let display = category.children[1].style.display !== 'block';
			category.children[1].style.display = display ? 'block' : 'none';
			category.children[0].style.color = display ? 'orange' : 'white';
			category.children[0].style.borderBottom = display
				? '2px solid gold'
				: 'none';
		});
	}
}
