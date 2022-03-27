const BaseRoute = require('../../../../BaseRoute');

class Route extends BaseRoute {
	static path = '/connect-4/stats';
	static loginRequired = true;
}

module.exports = Route;
