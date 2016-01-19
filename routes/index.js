module.exports = function(app) {
	app.use('/api', require('./auth'));
	app.use('/api', require('./user'));
	app.use('/api', require('./item'));
};
