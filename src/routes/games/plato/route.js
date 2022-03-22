const BaseRoute = require('../../../BaseRoute');

class Route extends BaseRoute {
	static path = '/games/plato';
	static loginRequired = true;
}

module.exports = Route;
