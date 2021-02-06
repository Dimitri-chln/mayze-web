function generateClientToken() {
	if (!localStorage.getItem('mayze_user_token'))
		localStorage.setItem('mayze_user_token', generateRandomString());
}

function redirectLogin() {
	const randStr = generateRandomString();
	sessionStorage.setItem('state', randStr);

	sessionStorage.setItem('callback_location', '/');
	location.href = `https://discord.com/api/oauth2/authorize?client_id=703161067982946334&redirect_uri=${encodeURIComponent(`${location.origin}/callback`)}&state=${btoa(randStr)}&response_type=code&scope=identify%20guilds&prompt=none`;
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