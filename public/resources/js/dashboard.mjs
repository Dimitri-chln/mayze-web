import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/clan/members?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const members = await res.json().catch(() => {});

		const ol = document.getElementById('member-list');

		for (let member of members) {
			let separator = document.createElement('div');
				separator.className = 'separator';
			ol.appendChild(separator);
			
			let li = document.createElement('li');

			let spanMember = document.createElement('span');
				spanMember.className = 'member';
				spanMember.innerHTML = member.username;
			let spanJoinedAt = document.createElement('span');
				spanJoinedAt.className = 'joined-at';
				spanJoinedAt.innerHTML = formatDate(member.joined_at);
			
			li.appendChild(spanMember);
			li.appendChild(spanJoinedAt);

			ol.appendChild(li);
		}

		function formatDate(date) {
			const months = [ 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre' ];

			let year = date.substr(0, 4);
			let month = months[parseInt(date.substr(5, 2)) - 1];
			let day = date.substr(8, 2);

			return `${day} ${month} ${year}`;
		}
	});