var dbConfig = require('../config/dbConfig.json');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  dbConfig.options);

var User = require('./UserModel')(sequelize);
var Item = require('./ItemModel')(sequelize, User.Model);

Item.belongsTo(User, { as: 'Owner', foreignKey: 'userId' });

sequelize.sync().catch(function (exception) {
	console.log(exception);
});

module.exports.User = User;
module.exports.Item = Item;