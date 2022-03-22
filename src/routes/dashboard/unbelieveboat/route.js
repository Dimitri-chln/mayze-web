const BaseRoute = require('../../../BaseRoute');

class Route extends BaseRoute {
	static path = '/dashboard/unbeliveboat';
	static loginRequired = true;
	static memberRequired = true;
}

module.exports = Route;
