var crypto = require('crypto');
var async = require('async');
var User = require('../models').User;
var errors = require('../errors');
var validator = require('../validators').userValidator;

var requireRegistrationFields = ['mail', 'password', 'name']

module.exports = {
    registration: function (req, res) {
        async.waterfall([
            function validate(callback) {
                var err = null;
                var registrationData = {
                    mail: req.body.email,
                    name: req.body.name,
                    phone: req.body.phone,
                    password: req.body.password
                };

                var validate = validator(registrationData, requireRegistrationFields);
                if (validate.errors.length !== 0) {
                    err = validate.errors;
                }

                callback(err, validate.values);
            },
            function register(values, callback) {
                values.token = crypto.createHash('md5')
                    .update(values.name)
                    .update(values.mail)
                    .update(values.password)
                    .digest("base64");

                User.create(values).then(function (user) {
                    var result = { token: user.get('token') };

                    callback(null, result);
                }).catch(function (exception) {
                    callback(new errors.UnprocessableEntity('mail'));
                });

            },
        ], function (err, result) {
            if (err) {
                var error = Array.isArray(err) ? err : [err];
                res.status(422).json(error);
            } else {
                res.status(200).json(result);
            }

            res.end();
        });

    },

    login: function (req, res) {
        var mail = req.body.email;
        var password = req.body.password;
        async.waterfall([
            function createOption(callback) {
                var options = { mail: mail };
                callback(null, options);
            },
            function (options, callback) {
                User.findOne({
                    where: options
                }).then(function (user) {
                    callback(null, user);
                }).catch(function (exception) {
                    callback(new errors.UnprocessableEntity('mail'));
                });
            },
            function checkPassword(user, callback) {
                var err = null;
                var result = null;
                var userPassword = user.get('password')
                if (password === userPassword) {
                    result = { token: user.get('token') };
                } else {
                    err = errors.UnprocessableEntity('password');
                }

                callback(err, result);
            }
        ], function (err, result) {
            if (err) {
                var error = Array.isArray(err) ? err : [err];
                res.status(422).json(error);
            } else {
                res.status(200).json(result);
            }

            res.end();
        });
    }
};