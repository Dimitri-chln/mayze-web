export function setCookie(cname, cvalue, exdays) {
	let d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/; SameSite=strict`;
}

export function getCookie(cname) {
	let name = cname + '=';
	let clist = document.cookie.split(/ *; */);
	for(let c of clist) {
		if (c.startsWith(name))
			return c.substr(name.length);
  	}
	return '';
}
