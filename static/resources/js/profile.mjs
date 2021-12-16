import { getCookie } from '../../modules/cookie.mjs';
import { formatDate } from '../../modules/utils.mjs';


const MEMBER_RANKS = {
	'MEMBER': 'Membre',
	'CO-LEADER': 'Sous-chef',
	'LEADER': 'Chef'
};


fetch(`api/discord/user?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const user = await res.json();

        document.getElementById('member-title').firstElementChild.innerHTML = user.username;
    });


fetch(`api/discord/member?token=${getCookie('token')}`, {
	method: 'GET'
})
	.then(async res => {
		const member = await res.json();
		console.log(member)
		
		document.getElementById('member-discord-tag').innerHTML = member.discord.tag;
		document.getElementById('member-wolvesville-username').innerHTML = member.wolvesville.username;
		document.getElementById('member-rank').innerHTML = MEMBER_RANKS[member.wolvesville.rank];
		document.getElementById('member-joined-at').innerHTML = formatDate(member.wolvesville.joinedAt);
	});