const BaseRoute = require("../../../BaseRoute");



class Route extends BaseRoute {
	static path = '/dashboard/unbeliveboat';
	static requireLogin = true;
	static requireMember = true;
}



module.exports = Route;