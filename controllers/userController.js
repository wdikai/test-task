var async = require('async');
var User = require('../models').User;
var errors = require('../errors');
var validator = require('../validators/').userValidator;

module.exports = {
    getMe: function (req, res) {
        var id = req.authorization.id;
        findUserById(id, function (err, user) {
            if (!err) {
                res.status(200).json(user.toUserModel());
            }

            res.end();
        });
    },

    updateMe: function (req, res) {
        var id = req.authorization.id;
        var newData = {
            mail: req.body.email,
            name: req.body.name,
            phone: req.body.phone,
            password: req.body.new__password,
        };
        var currentPassword = req.body.current_password;

        async.waterfall([
            function getMe(callback) {
                findUserById(id, callback);
            },
            function validate(user, callback) {
                var err = null;
                var validate = validator(newData);
                if (newData.password && !currentPassword && currentPassword !== user.get('user')) {
                    validate.errors.push(new errors.UnprocessableEntity('curent_password'));
                }

                if (validate.errors.length > 0) {
                    err = {
                        errorList: validate.errors,
                        status: 422
                    };
                }

                callback(err, user, validate.values);
            },
            function change(user, values, callback) {
                user.update(values).then(function (chengedUser) {
                    callback(null, chengedUser.toUserModel());
                }).catch(function (err) {
                    callback(err);
                });
            }

        ], function (err, chengedUser) {
            if (err && err.status) {
                res.status(err.status).json(err.errorList);
            } else {
                res.status(200).send(chengedUser);
            }

            res.end();
        });
    },

    getUserById: function (req, res) {
        var id = req.params.id;
        findUserById(id, function (err, user) {
            if (!err) {
                res.status(200).json(user);
            } else {
                res.status(404);
            }

            res.end();
        });
    },

    searchUser: function (req, res) {
        var options = {
            name: req.query.name,
            mail: req.query.email
        };

        async.waterfall([
            function validate(callback) {
                var values = {};
                for (var key in options) {
                    if (options.hasOwnProperty(key) && options[key]) {
                        values[key] = { $like: '%' + options[key] + '%' };
                    }
                }

                callback(null, values);
            },
            function find(values, callback) {
                User.findAll({
                    where: values
                }).then(function (users) {
                    callback(null, users);
                }).catch(function (exception) {
                    callback(exception);
                });
            },
            function filter(users, callback) {
                var result = [];
                users.forEach(function (user) {
                    result.push(user.toUserModel());
                });

                callback(null, result);
            }

        ], function (err, users) {
            if (!err) {
                res.status(200).json(users);
            }
            res.end();
        });
    }
};


function findUserById(id, callback) {
    async.waterfall([
        function find(callback) {
            User.findById(id).then(function (user) {
                if (user) {
                    callback(null, user);
                } else {
                    var err = new Error('NotFound');
                    err.status = 404;
                    callback(err);
                }
            });
        }
    ], function (err, user) {
        callback(err, user);
    });
}
