var Sequelize = require('sequelize');
var async = require('async');

module.exports = function (sequelize, UserModel) {

    var scheme = {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        userId: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: UserModel,
                key: 'id'
            }
        }
    };

    var ItemModel = sequelize.define('item', scheme);


    return ItemModel;
}