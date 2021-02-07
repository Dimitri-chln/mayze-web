import { generateClientToken } from './modules/utils.mjs';

generateClientToken();
checkLogin();

function checkLogin() {
	fetch(`/api/discord/user?user_token=${localStorage.getItem('mayze_user_token')}`, {
		method: 'GET'
	})
		.then(async res => {
			const user = await res.json().catch(() => {});
			if (!user) return;

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

			const isMember = document.getElementById('is-member').children.item(0);
			isMember.innerHTML = 'Connexion...';

			fetch(`/api/discord/guilds?user_token=${localStorage.getItem('mayze_user_token')}`, {
				method: 'GET'
			})
				.then(async res => {
					const guilds = await res.json().catch(() => {});
					if (!guilds) return;

					if (guilds.some(guild => guild.id === '689164798264606784')) {
						isMember.innerHTML = '✨ Tu es membre de Mayze ! ✨';
					} else {
						isMember.innerHTML = 'Tu n\'es pas un membre de Mayze';
					}
				});

		});
}