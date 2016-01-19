var async = require('async');
var Item = require('../models').Item;
var errors = require('../errors');
var validator = require('../validators/').itemValidator;
var fs = require('fs');

module.exports = {

    createItem: function (req, res) {
        async.waterfall([
            function getRequestData(callback) {
                var newItemData = {
                    title: req.body.title,
                    price: req.body.price,
                };
                callback(null, newItemData);
            },
            function validate(newItemData, callback) {
                var err = null;
                var validate = validator(newItemData, ['title', 'price']);
                if (validate.errors.length > 0) {
                    err = {
                        errorList: validate.errors,
                        status: 422
                    };
                }

                callback(err, validate.values);
            },
            function create(values, callback) {
                values.userId = req.authorization.id;
                Item.build(values).save().catch(function (exception) {
                    callback(exception);
                }).then(function (item) {
                    callback(null, item)
                });
            },
            filterItemModel
        ], function (err, newItem) {
            if (!err) {
                res.status(200).send(newItem);
            } else {
                res.status(err.status).json(err.errorList);
            }

            res.end();
        });
    },

    updateItem: function (req, res) {
        async.waterfall([
            function getRequestData(callback) {
                var newItemData = {
                    title: req.body.title,
                    price: req.body.price,
                };

                callback(null, newItemData);
            },
            function validate(newItemData, callback) {
                var err = null;
                var validate = validator(newItemData);
                if (validate.errors.length !== 0) {
                    err = {
                        errorList: validate.errors,
                        status: 422
                    };
                }

                callback(err, validate.values);
            },
            function update(values, callback) {
                var id = req.params.id;
                var userId = req.authorization.id;
                Item.findById(id).then(function (item) {
                    var err = null;
                    if (!item) {
                        err = new Error('NotFound');
                        err.status = 404;
                        callback(err);
                    }

                    if (item.get('userId') != userId) {
                        err = new Error('AccessDenied');
                        err.status = 403;
                        callback(err);
                    }

                    item.update(values).then(function (updateItem) {
                        callback(err, updateItem);
                    }).catch(function (err) {
                        callback(err);
                    });
                }).catch(function (exception) {
                });
            },
            filterItemModel

        ], function (err, chengedItem) {
            if (!err) {
                res.status(200).json(chengedItem);
            } else {
                res.status(err.status).json(err.errorList);
            }

            res.end();
        });
    },

    dropItem: function (req, res) {
        var id = req.params.id;
        var userId = req.authorization.id;
        async.waterfall([
            function searchItem(callback) {
                Item.findById(id).then(function (item) {
                    var err = null;
                    if (!item) {
                        err = new Error('NotFound');
                        err.status = 404;
                    }

                    callback(err, item);
                }).catch(function (exception) {
                    callback(exception);
                });
            },
            function cheakAccess(item, callback) {
                var err = null;
                if (item.get('userId') != userId) {
                    err = new Error('AccessDenied');
                    err.status = 403;
                }

                callback(err, item);
            },
            function drop(item, callback) {
                item.destroy().then(function () {
                    callback(null);
                });
            }

        ], function (err) {
            if (!err) {
                res.status(200);
            } else {
                res.status(err.status);
            }

            res.end();
        });
    },

    getItemById: function (req, res) {
        var id = req.params.id;
        async.waterfall([
            function (callback) {
                Item.findById(id).then(function (item) {
                    callback(null, item);
                }).catch(function (err) {
                    console.log(err);
                    var err = new Error('NotFound');
                    err.status = 404;
                    callback(err);
                });
            },
            filterItemModel
        ], function (err, item) {
            if (!err) {
                res.status(200).json(item);
            } else {
                res.status(err.status);
            }

            res.end();
        });
    },

    findItem: function (req, res) {
        async.waterfall([
            function getRequestData(callback) {
                var itemData = {
                    title: req.query.title,
                    id: req.query.user_id,
                };

                var order = {
                    field: req.query.order_by || 'createdAt',
                    type: req.query.order_type || 'desc'
                };

                callback(null, itemData, order);
            },
            function createSearchOptions(itemData, order, callback) {
                var values = {};
                for (var key in itemData) {
                    if (itemData.hasOwnProperty(key) && itemData[key]) {
                        values[key] = { $like: '%' + itemData[key] + '%' };
                    }
                }

                var validOrder = validator(order);
                callback(null, values, validOrder.values);
            },
            function findItemsData(values, order, callback) {
                var options = {
                    order: [[order.field, order.type]]
                };

                options.where = values;
                Item.findAll(options).then(function (items) {
                    callback(null, items);
                }).catch(function (err) {
                    callback(err);
                });
            }, function filtrate(itemsData, callback) {
                async.map(itemsData, filterItemModel, function (err, result) {
                    callback(err, result);
                });
            }
        ], function (err, items) {
            if (!err) {
                res.status(200).json(items);
            }

            res.end();
        });
    },

    uploadImage: function (req, res) {
        var id = req.params.id;
        var userId = req.authorization.id;
        var imageSize = req.files[0].fileSize;
        var image = req.files[0].filename;
        async.waterfall([
            function validate(callback) {
                var err = null;
                if (imageSize > 1024 * 1024 * 100) {
                    var ex = new errors.UnprocessableEntity('image');
                    ex.message = 'The file {file} is too big.';
                    err = {
                        status: 422,
                        body: ex
                    }
                }
                callback(err);
            },
            function find(callback) {
                Item.findById(id).then(function (item) {
                    var err = null;
                    if (!item) {
                        err = new Error('NotFound');
                        err.status = 404;
                        callback(err);
                    }

                    callback(err, item);
                });
            },
            function checkAccess(item, callback) {
                var err = null;
                if (item.get('userId') != userId) {
                    err = new Error('AccessDenied');
                    err.status = 403;
                    callback(err);
                }

                callback(err, item);
            },
            function updateDB(item, callback) {
                item.set('image', image).save().then(function (updateItem) {
                    callback(null, updateItem);
                }).catch(function (err) {
                    callback(err);
                });
            },
            filterItemModel
        ], function (err, item) {
            if (!err) {
                res.status(200).json(item);
            } else {
                var result = err.body || {};
                res.status(err.status).json(result);
            }

            res.end();
        });
    },

    dropImage: function (req, res) {
        var id = req.params.id;
        var userId = req.authorization.id;
        async.waterfall([
            function find(callback) {
                Item.findById(id).then(function (item) {
                    var err = null;
                    if (!item) {
                        err = new Error('NotFound');
                        err.status = 404;
                        callback(err);
                    }

                    callback(err, item);
                });
            },
            function checkAccess(item, callback) {
                var err = null;
                if (item.get('userId') != userId) {
                    err = new Error('AccessDenied');
                    err.status = 403;
                    callback(err);
                }

                callback(err, item);
            },
            function dropFile(item, callback) {
                fs.unlink(__dirname + "/../public/uploads/" + item.get('image'), function (err) {
                    callback(err, item);
                })
            },
            function updateDB(item, callback) {
                item.set('image', null).save().then(function (updateItem) {
                    callback(null, updateItem);
                }).catch(function (err) {
                    callback(err);
                });
            },
            filterItemModel
        ], function (err, item) {
            if (!err) {
                res.status(200);
            } else {
                res.status(err.status);
            }

            res.end();
        });
    }
};

function filterItemModel(item, callback) {
    item.getOwner().then(function (owner) {
        var itemModel = {
            id: item.get('id'),
            createdAt: item.get('createdAt'),
            title: item.get('title'),
            price: item.get('price'),
            image: item.get('image'),
            userId: item.get('userId'),
            user: owner.toUserModel()
        };
        if (itemModel.image) {
            itemModel.image = "http://localhost:3000/uploads/" + itemModel.image;
        }

        callback(null, itemModel);
    }).catch(function (err) {
        callback(err);
    });
}