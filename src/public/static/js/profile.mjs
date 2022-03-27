import { getCookie } from '../modules/cookie.mjs';
import { formatDate, formatXP } from '../modules/utils.mjs';

const MEMBER_RANKS = {
	MEMBER: 'Membre',
	'CO-LEADER': 'Sous-chef',
	LEADER: 'Chef',
};

fetch(`api/discord/user?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const user = await res.json();

	document.getElementById('member-title').firstElementChild.innerHTML = user.username;
});

fetch(`api/discord/member?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const member = await res.json();

	document.getElementById('member-discord-tag').innerHTML = member.discord.tag;
	document.getElementById(
		'member-discord-avatar',
	).innerHTML = `<a href=${member.discord.avatar}>Clique pour visualiser</a>`;
	document.getElementById('member-wolvesville-username').innerHTML = member.wolvesville.username;
	document.getElementById('member-rank').innerHTML = MEMBER_RANKS[member.wolvesville.rank];
	document.getElementById('member-joined-at').innerHTML = formatDate(member.wolvesville.joinedAt);
	document.getElementById('member-chat-total-xp').innerHTML = formatXP(member.discord.chat_total_xp);
	document.getElementById('member-chat-level').innerHTML = member.discord.chat_level;
	document.getElementById('member-voice-total-xp').innerHTML = formatXP(member.discord.voice_total_xp);
	document.getElementById('member-voice-level').innerHTML = member.discord.voice_level;
});
