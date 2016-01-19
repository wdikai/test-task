var User = require('../models').User;

var checkedToken = function (req, res, next) {
	var token = req.get('Authorization');
	User.getUserByToken(token, function(err, user) {
		if(!err) {
			req.authorization = { id: user.id };
			next();
		} else {
			res.status(401).end();
		}
	});
}

module.exports = checkedToken;