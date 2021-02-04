function generateClientToken() {
	if (!localStorage.getItem('mayze_user_token'))
		localStorage.setItem('mayze_user_token', generateRandomString());
}

function redirectLogin() {
	const randStr = generateRandomString();
	sessionStorage.setItem('state', randStr);

	sessionStorage.setItem('callback_location', location.href);
	location.href = `https://discord.com/api/oauth2/authorize?client_id=703161067982946334&redirect_uri=${encodeURIComponent('https://mayze2.herokuapp.com/callback')}&state=${btoa(randStr)}&response_type=code&scope=identify%20guilds&prompt=none`;
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

function checkLogin() {
	fetch(`/api/discord/user?user_token=${localStorage.getItem('mayze_user_token')}`, {
		method: 'GET'
	})
		.then(res => res.json())
		.then(user => {
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