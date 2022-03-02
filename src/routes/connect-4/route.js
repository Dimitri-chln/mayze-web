const BaseRoute = require('../../BaseRoute');

class Route extends BaseRoute {
	static path = '/connect-4';
	static requireLogin = true;
	static requireMember = true;
}

module.exports = Route;
