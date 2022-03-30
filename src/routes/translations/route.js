const BaseRoute = require('../../BaseRoute');

class Route extends BaseRoute {
	static path = '/translations';
	static loginRequired = true;
	static allowedUserIds = ['463358584583880704', '701832883236634754'];
}

module.exports = Route;
