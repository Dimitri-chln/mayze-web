import { getCookie } from '../../modules/cookie.mjs';
import { formatDate } from '../../modules/utils.mjs';

fetch(`api/clan/members?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const members = await res.json();

	const leader = document.getElementById('leader');
	leader.innerHTML = members.find((m) => m.rank === 3).username;

	const coLeaders = document.getElementById('co-leaders');
	coLeaders.innerHTML = members
		.filter((m) => m.rank === 2)
		.map((m) => m.username)
		.join(', ');

	const title = document.getElementById('member-count');
	title.innerHTML += ` - ${members.length}/50`;

	const ol = document.getElementById('member-list');

	fetch(`api/discord/member?token=${getCookie('token')}`, {
		method: 'GET',
	}).then(async (res) => {
		const requestingMember = await res.json();
		const isCoLeader = ['CO-LEADER', 'LEADER'].includes(
			requestingMember.wolvesville.rank,
		);

		for (let member of members) {
			const separator = document.createElement('div');
			separator.className = 'separator';
			ol.appendChild(separator);
			const li = document.createElement('li');
			const divMember = document.createElement('div');
			divMember.className = 'member-info';
			const spanMember = document.createElement('span');
			spanMember.className =
				member.rank === 3
					? 'leader'
					: member.rank === 2
					? 'co-leader'
					: 'member';
			spanMember.innerHTML = member.username;
			const spanDiscord = document.createElement('span');

			if (member.user_id) {
				spanDiscord.className = 'member-discord';
				spanDiscord.innerHTML = `@${member.discord_tag}`;

				// let spanDiscordHyperlink = document.createElement('a');
				// spanDiscordHyperlink.href = `discord://https://discord.com/channels/@me/${member.user.id}`;
				// spanDiscordHyperlink.innerHTML = `@${member.user.tag}`;
				// spanDiscord.appendChild(spanDiscordHyperlink);
			} else {
				spanDiscord.innerHTML = '-';
			}

			let editButton;
			if (isCoLeader) {
				editButton = document.createElement('button');
				editButton.className = 'edit-button';
				editButton.innerHTML = 'Modifier';
				editButton.addEventListener('click', () => {
					document.getElementById('popup-form').style.display = 'block';
					document.getElementById(
						'form-title',
					).innerHTML = `Modifier ${member.username}`;
					document.getElementById('field-username').value = member.username;
					document.getElementById('field-username').focus();
					document.getElementById('field-discord').value = member.user_id || '';
					document.getElementById('field-joined').min = '2019-07-30';
					document.getElementById('field-joined').max = new Date()
						.toISOString()
						.substring(0, 10);
					document.getElementById('field-joined').value =
						member.joined_at.substring(0, 10);
					document.getElementById('field-rank').options[
						member.rank - 1
					].selected = true;
					document.getElementById('delete-button').style.display = 'block';
				});
			}

			divMember.appendChild(spanMember);
			divMember.appendChild(spanDiscord);
			if (editButton) divMember.append(editButton);

			let spanJoinedAt = document.createElement('span');
			spanJoinedAt.className = 'joined-at';
			spanJoinedAt.innerHTML = formatDate(member.joined_at);

			li.appendChild(divMember);
			li.appendChild(spanJoinedAt);

			ol.appendChild(li);
		}

		if (isCoLeader) {
			let memberTitle = document.getElementById('member-title');
			let createButton = document.createElement('button');
			createButton.className = 'create-button';
			createButton.innerHTML = 'Ajouter un membre';
			createButton.addEventListener('click', () => {
				document.getElementById('popup-form').style.display = 'block';
				document.getElementById('form-title').innerHTML = `Ajouter un membre`;
				document.getElementById('field-username').value = '';
				document.getElementById('field-username').focus();
				document.getElementById('field-discord').value = '';
				document.getElementById('field-joined').min = '2019-07-30';
				document.getElementById('field-joined').max = new Date()
					.toISOString()
					.substr(0, 10);
				document.getElementById('field-joined').value = new Date()
					.toISOString()
					.substr(0, 10);
				document.getElementById('field-rank').options[0].selected = true;
				document.getElementById('delete-button').style.display = 'none';
			});

			memberTitle.appendChild(createButton);
		}

		if (screen.width < 768) {
			for (let row of document.getElementsByClassName('member-info')) {
				row.parentElement.addEventListener('click', () => {
					let display = row.children[2].style.display !== 'block';
					row.children[2].style.display = display ? 'block' : 'none';
				});
			}
		}
	});
});

document.getElementById('cancel-button').addEventListener('click', (event) => {
	event.preventDefault();
	document.getElementById('popup-form').style.display = 'none';
});
document
	.getElementById('delete-button')
	.addEventListener('click', (event) => modifyMember(event, 'DELETE'));
document
	.getElementById('save-button')
	.addEventListener('click', (event) => modifyMember(event, 'POST'));

function modifyMember(event, method) {
	event.preventDefault();

	method =
		method === 'POST'
			? document.getElementById('form-title').innerHTML === 'Ajouter un membre'
				? 'POST'
				: 'PATCH'
			: method;

	let memberName =
		method !== 'POST'
			? document.getElementById('form-title').innerHTML.replace('Modifier ', '')
			: null;
	let username = document.getElementById('field-username').value;
	let userID = document.getElementById('field-discord').value;
	let joinedAt = document.getElementById('field-joined').value;
	let rank = document.getElementById('field-rank').value;

	if (!validateUsername(username)) return alert('Le pseudo est invalide');
	if (userID && !validateId(userID)) return alert("L'ID Discord est invalide");

	fetch(
		`api/clan/members?token=${getCookie('token')}${
			memberName ? `&member=${memberName}` : ''
		}&username=${username}${
			userID ? `&user_id=${userID}` : ''
		}&joined_at=${joinedAt}&rank=${rank}`,
		{
			method,
		},
	).then(async (res) => {
		if (res.status !== 200)
			return alert("Quelque chose s'est mal passé en modifiant les données");
		location.href = '/dashboard';
	});

	function validateUsername(value) {
		const regex = /^\w[\w_]{2,13}$/i;
		return regex.test(value);
	}

	function validateId(id) {
		const regex = /^\d{18}$/;
		return regex.test(id);
	}
}
