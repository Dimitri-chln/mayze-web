function generateClientToken() {
	if (!localStorage.getItem('mayze_user_token'))
		localStorage.setItem('mayze_user_token', generateRandomString());
}

function redirectLogout() {
	fetch(`/api/discord/logout?user_token=${localStorage.getItem('mayze_user_token')}`, {
			method: 'POST'
	}).then(res => {
		location.href = '/';
	});
}

function forceRedirect() {
	location.href = '/';
}