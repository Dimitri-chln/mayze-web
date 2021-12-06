export function setCookie(cname, cvalue, exdays) {
	let d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/; SameSite=strict`;
}

export function getCookie(cname) {
	let clist = document.cookie.split(/ *; */);
	for (let c of clist) {
		let [ , name, value ] = c.match(/(\w+?)=(.+)/) || [];
		if (name === cname) return value;
  	}
	return '';
}