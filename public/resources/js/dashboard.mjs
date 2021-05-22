import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/clan/members?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const members = await res.json().catch(() => {});

		const leader = document.getElementById('leader');
		leader.innerHTML = members.find(m => m.rank === 3).username;

		const coLeaders = document.getElementById('co-leaders');
		coLeaders.innerHTML = members.filter(m => m.rank === 2).map(m => m.username).join(', ');

		const title = document.getElementById('member-count');
		title.innerHTML += ` - ${members.length}/50`;

		const ol = document.getElementById('member-list');

		for (let member of members) {
			let separator = document.createElement('div');
				separator.className = 'separator';
			ol.appendChild(separator);
			
			let li = document.createElement('li');

			let divMember = document.createElement('div');
				divMember.className = 'member-info';
			
			let spanMember = document.createElement('span');
				spanMember.className = member.rank === 3 ? 'leader'
					: member.rank === 2 ? 'co-leader'
					: 'member';
				spanMember.innerHTML = member.username;
			let spanDiscord = document.createElement('span');
			if (member.user_id) {
				spanDiscord.className = 'member-discord';
				fetch(`api/discord/user?token=${getCookie('token')}&user_id=${member.user_id}`, {
					method: 'GET'
				})
					.then(async res => {
						const user = await res.json().catch(() => {});
						if (res.status === 200)	spanDiscord.innerHTML = `@${user.tag}`;
						else spanDiscord.innerHTML = '-';
					});
			} else {
				spanDiscord.innerHTML = '-';
			}
			
			divMember.appendChild(spanMember);
			divMember.appendChild(spanDiscord);

			let spanJoinedAt = document.createElement('span');
				spanJoinedAt.className = 'joined-at';
				spanJoinedAt.innerHTML = formatDate(member.joined_at);
			
			li.appendChild(divMember);
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