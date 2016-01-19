var Sequelize = require('sequelize');

var scheme = {
    id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    mail: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: "customerMail"
    },
    name: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
    },
    token: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: "userToken"
    },
};

module.exports = function (sequelize) {

    var UserModel = sequelize.define('user', scheme, {
        instanceMethods: {
            toUserModel: function () {
                return {
                    id: this.get('id'),
                    name: this.get('name'),
                    mail: this.get('mail'),
                    phone: this.get('phone')
                };
            }
        },
        classMethods: {
            getUserByToken: function (userToken, callback) {
                var options = { token: userToken };

                this.getUserByOptions(options, function (err, userData) {
                    var user = null;
                    if (!err) {
                        user = userData.toUserModel();
                    }

                    callback(err, user);
                });
            },
            getUserByOptions: function (options, callback) {
                UserModel.findOne({
                    where: options
                }).then(function (user) {
                    callback(null, user);
                }).catch(function (err) {
                    callback(err);
                });
            },
        }
    });

    return UserModel;
};