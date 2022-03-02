const BaseRoute = require('../../BaseRoute');

class Route extends BaseRoute {
	static path = '/download';
	static requireLogin = true;
}

module.exports = Route;
