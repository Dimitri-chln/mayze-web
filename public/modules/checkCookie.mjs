import { getCookie, setCookie } from './cookie.mjs';
import { generateRandomString } from './utils.mjs';

let user = getCookie('token');
if (!user) setCookie('token', generateRandomString(), 365);