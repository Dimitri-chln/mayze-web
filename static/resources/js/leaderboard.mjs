import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/leaderboard?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const leaderboard = await res.json();
		if (!leaderboard.length) return;

		const ol = document.getElementById('leaderboard');

		for (let user of leaderboard) {
			const li = document.createElement('li');

			const divMember = document.createElement('div');
				divMember.className = 'member';
			const memberRank = document.createElement('span');
				memberRank.innerHTML = user.rank;
				memberRank.style.width = `${0.75 * user.rank.toString().length}em`;
			const memberAvatar = document.createElement('img');
				memberAvatar.src = user.avatar;
				memberAvatar.alt = 'Avatar';
			const memberName = document.createElement('p');
				memberName.innerHTML = user.username;
			
			divMember.appendChild(memberRank);
			divMember.appendChild(memberAvatar);
			divMember.appendChild(memberName);

			const divStats = document.createElement('div');
				divStats.className = 'member-stats';
			const statsXP = document.createElement('p');
				statsXP.innerHTML = formatXP(user.total_xp);
			const statsLevel = document.createElement('p');
				statsLevel.innerHTML = `Niveau ${user.level}`;
			
			divStats.appendChild(statsXP);
			divStats.appendChild(statsLevel);

			li.appendChild(divMember);
			li.appendChild(divStats);

			ol.appendChild(li);
		}

		function formatXP(xp) {
			const suffixes = ['', 'k', 'm', 'g'];

			while (xp > 1000) {
				suffixes.shift();
				xp = xp / 1000;
			}

			return `${(Math.round(xp * 10) / 10) + suffixes[0]} XP`;
		}
	});