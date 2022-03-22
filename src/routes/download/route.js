const BaseRoute = require('../../BaseRoute');

class Route extends BaseRoute {
	static path = '/download';
	static loginRequired = true;
	static memberRequired = true;
}

module.exports = Route;
