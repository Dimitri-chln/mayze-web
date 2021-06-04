function closeForm(event) {
	event.preventDefault();
	document.getElementById('popup-form').style.display = 'none';
}

function editMember(event, action) {
	event.preventDefault();

	action = action === 'edit'
		? document.getElementById('form-title').innerHTML === 'Ajouter un membre' ? 'create' : 'edit'
		: action;

	let memberName = action !== 'create'
		? document.getElementById('form-title').innerHTML.replace('Modifier ', '')
		: null;
	let username = document.getElementById('field-username').value;
	let userID = document.getElementById('field-discord').value;
	let joinedAt = `${document.getElementById('field-joined').value}T12:00:00Z`;
	let rank = document.getElementById('field-rank').value;

	fetch(`api/clan/members/${action}?${memberName ? `member=${memberName}&` : ''}username=${username}&user_id=${userID}&joined_at=${joinedAt}&rank=${rank}`, {
		method: 'POST'
	})
		.then(async res => {
			if (res.status !== 200) return alert('Quelque chose s\'est mal passé en modifiant les données');
			location.href = '/dashboard';
		});
}