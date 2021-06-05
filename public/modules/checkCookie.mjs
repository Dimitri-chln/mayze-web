import { getCookie, setCookie } from './cookie.mjs';
import { generateRandomString } from './utils.mjs';

let user = getCookie('token');
if (!user) setCookie('token', generateRandomString(), 365);

if (
	(!!window.ApplePaySetupFeature || !!window.safari)
	&& navigator.userAgent.toLowerCase().search("safari") > -1
	&& navigator.userAgent.toLowerCase().search("chrome") === -1
	&& navigator.userAgent.toLowerCase().search("crios") === -1
) alert(`debug:\n${document.cookie}`);