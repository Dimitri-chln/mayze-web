const BaseRoute = require("../../BaseRoute");



class Route extends BaseRoute {
	static path = '/leaderboard';
	static requireLogin = true;
	static requireMember = true;
}



module.exports = Route;