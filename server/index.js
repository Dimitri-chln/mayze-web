function redirectLogin() {
	const randStr = generateRandomString();
	sessionStorage.setItem('state', randStr);

	sessionStorage.setItem('callback_location', location.href);
	location.href = `https://discord.com/api/oauth2/authorize?client_id=703161067982946334&redirect_uri=${encodeURI('https://mayze-v2.herokuapp.com/callback')}&state=${btoa(randStr)}&response_type=code&scope=identify%20guilds&prompt=none`;
}

function generateRandomString() {
	const rand = Math.floor(Math.random() * 10);
	let randStr = '';

	for (let i = 0; i < 20 + rand; i++) {
		randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
	}

	return randStr;
}