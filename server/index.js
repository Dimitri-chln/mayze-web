function generateClientToken() {
	if (!localStorage.getItem('mayze_user_token'))
		localStorage.setItem('mayze_user_token', generateRandomString());
}

function generateRandomString() {
	const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';
	const rand = Math.floor(Math.random() * 10);
	let randStr = '';

	for (let i = 0; i < 40 + rand; i++) {
		randStr += charList.charAt(Math.floor(Math.random() * charList.length));
	}

	return randStr;
}

function redirectLogin() {
	location.href = '/login';
}

function checkLogin() {
	fetch(`/api/discord/user?user_token=${localStorage.getItem('mayze_user_token')}`, {
		method: 'GET'
	})
		.then(async res => {
			const user = await res.json().catch(() => false);
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
		});
}