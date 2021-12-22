import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/leaderboard?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const leaderboard = await res.json();
		const leaderboardType = document.querySelector('input[name="leaderboard"]:checked').value;
		if (!leaderboard.length) return;

		createLeaderboard(leaderboard, leaderboardType);

		const radios = document.querySelectorAll('input[type=radio][name="leaderboard"]');
		radios.forEach(radio => {
			radio.addEventListener('change', () => {
				createLeaderboard(leaderboard, radio.value);
			});
		});
	});


/**
 * @param {object[]} leaderboard 
 * @param {"text" | "voice"} leaderboardType 
 */
function createLeaderboard(leaderboard, leaderboardType) {
	const ol = document.getElementById('leaderboard');
	
	// Clear previous leaderboard
	while (ol.lastElementChild) ol.removeChild(ol.lastElementChild);

	// Sort the leaderboard appropriately
	leaderboard.sort((a, b) => leaderboardType === 'text' ? a.chat_rank - b.chat_rank : a.voice_rank - b.voice_rank);

	for (let user of leaderboard) {
		const li = document.createElement('li');

		const divMember = document.createElement('div');
			divMember.className = 'member';
		const memberRank = document.createElement('span');
			memberRank.innerHTML = leaderboardType === 'text' ? user.chat_rank : user.voice_rank;
			memberRank.style.width = `${0.75 * memberRank.innerHTML.toString().length}em`;
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
			statsXP.innerHTML = formatXP(leaderboardType === 'text' ? user.chat_total_xp : user.voice_total_xp);
		const statsLevel = document.createElement('p');
			statsLevel.innerHTML = `Niveau ${leaderboardType === 'text' ? user.chat_level : user.voice_level}`;
		
		divStats.appendChild(statsXP);
		divStats.appendChild(statsLevel);

		li.appendChild(divMember);
		li.appendChild(divStats);

		ol.appendChild(li);
	}
}


function formatXP(xp) {
	const suffixes = ['', 'k', 'm', 'g'];

	while (xp > 1000) {
		suffixes.shift();
		xp = xp / 1000;
	}

	return `${(Math.round(xp * 10) / 10) + suffixes[0]} XP`;
}