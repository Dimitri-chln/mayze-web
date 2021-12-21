const BaseRoute = require("../../../BaseRoute");



class Route extends BaseRoute {
	static path = '/games/plato';
	static requireLogin = true;
}



module.exports = Route;