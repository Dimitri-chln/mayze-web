const BaseRoute = require("../../BaseRoute");



class Route extends BaseRoute {
	static path = '/profile';
	static requireLogin = true;
}



module.exports = Route;