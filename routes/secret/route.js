const BaseRoute = require("../../BaseRoute");



class Route extends BaseRoute {
	static path = '/secret';
	static requireLogin = true;
}



module.exports = Route;