import { getCookie } from '../../modules/cookie.mjs';

fetch(`api/leaderboard?token=${getCookie('token')}`, {
    method: 'GET'
})
    .then(async res => {
        const leaderboard = await res.json();
		if (!leaderboard.length) return;

        const ol = document.getElementById('leaderboard');

        for (let user of leaderboard) {
            let li = document.createElement('li');

            let divMember = document.createElement('div');
            divMember.className = 'member';
            let memberRank = document.createElement('span');
                memberRank.innerHTML = user.rank;
                memberRank.style.width = `${0.75 * user.rank.toString().length}em`;
            let memberAvatar = document.createElement('img');
                memberAvatar.src = user.avatar;
                memberAvatar.alt = 'Avatar';
            let memberName = document.createElement('p');
                memberName.innerHTML = user.username;
            divMember.appendChild(memberRank);
            divMember.appendChild(memberAvatar);
            divMember.appendChild(memberName);

            let divStats = document.createElement('div');
            divStats.className = 'member-stats';
            let statsXP = document.createElement('p');
                statsXP.innerHTML = formatXP(user.totalXP);
            let statsLevel = document.createElement('p');
                statsLevel.innerHTML = `Niveau ${user.level}`;
            divStats.appendChild(statsXP);
            divStats.appendChild(statsLevel);

            li.appendChild(divMember);
            li.appendChild(divStats);

            ol.appendChild(li);
        }

        function formatXP(xp) {
            const suffixes = [ '', 'k', 'm', 'g' ];

            while (xp > 1000) {
                suffixes.shift();
                xp = xp / 1000;
            }

            return `${(Math.round(xp * 10) / 10) + suffixes[0]} XP`;
        }
    });