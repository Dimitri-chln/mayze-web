const BaseRoute = require("../../BaseRoute");



class Route extends BaseRoute {
	static path = '/dashboard';
	static requireLogin = true;
}



module.exports = Route;