var _ = require('underscore'); // helper
var os = require('os');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var util = require('util');

/**********************
 * Public Interface
 **********************/

var Rest = function (app, path, schema) {
    this.limit = 25;
    this.orderBy = "title";
    if (typeof schema == 'string')
        this.schema = mongoose.model(schema);
    else    
        this.schema = schema;
    
    var instance = this;
    app.get(path + '', function(req,res) { return instance.list(req,res); });
    app.get(path + '/total', function(req,res) { return instance.total(req,res); });
    app.get(path + '/:id',  function(req,res) { return instance.read(req,res); });
    app.post(path, function(req,res) { return instance.create(req,res); });
    app.put(path + '/:id', function(req,res) { return instance.update(req,res); });
    app.del(path + '/:id', function(req,res) { return instance.del(req,res); });
}; 

Rest.prototype.filteredFind = function(req, res) {
    return this.schema.find();
}

/**
 * Return the item list
 */
Rest.prototype.list = function(req, res) {
    var offset = ~~req.query.offset || 0;
    var limit = ~~req.query.limit || this.limit;
    var orderBy = req.query.orderBy || this.orderBy;
    var reverse = req.query.reverse == "true";
    if (reverse)
        orderBy = "-" + orderBy;
    var search = req.query.search || "";
    var searchNumber = Number(search) || 0;
    var re = new RegExp(search, 'i');
    this.filteredFind(req, res)
        .skip(offset*limit)
        .limit(limit)
        .lean()
        .sort(orderBy)
        .exec(function (err, users) {
            return res.end(JSON.stringify(users));
        });
}

/**
 * Called before creating an item
 */
Rest.prototype.beforeCreate = function(req, res, item, next) {
    this.beforeUpdate(req, res, item, next);
}

/**
 * Create a new item
 */
Rest.prototype.create = function(req, res) {
    var instance = this;
    var item = this.schema();
    function create() {
        item = _(item).extend(req.body);
        item.save(function onSave(err, item) {
            if (err) {
                res.json(formatRespData(0, err));
            } else {
                res.json(formatRespData({id: item.id}));
            }
        });
    }
    this.beforeCreate(req, res, item, create);
}

/**
 * Read an item
 */
Rest.prototype.read = function(req, res) {
    var id = req.params.id;
    this.schema.findOne({ _id: id }).lean().exec(function onFindOne(err, item) {
        if (!item)
            res.json(formatRespData(0, "Can't find item with id: " + id));
        else
            res.json(formatRespData(item));
    });
}

/**
 * Called before updating and existing item
 */
Rest.prototype.beforeUpdate = function(req, res, item, next) {
    next();
}

/**
 * Update an existing item
 */
Rest.prototype.update = function(req, res) {
    var id = req.params.id;
    var instance = this;
    this.schema.findOne({ _id: id }).exec(function onFindOne(err, item) {
        function saveItem() {
            item = _(item).extend(req.body);
            item.save(function onSave(err, item) {
                if (err) {
                    res.json(formatRespData(0, err));
                } else {
                    res.json(formatRespData({}));
                }
            });
        }

        instance.beforeUpdate(req, res, item, saveItem);
    });
}

/**
 * Called before deleting an item
 */
Rest.prototype.beforeDelete = function(req, res, item, next) {
    next();
}

/**
 * Delete an item
 */
Rest.prototype.del = function(req, res) {
    var id = req.params.id;
    var instance = this;
    function del() {
        instance.schema.remove({ _id: id }, function onRemove(err) {
            if (err) {
                res.json(formatRespData(0, err));
            } else {
                res.json(formatRespData({}));
            };
        });
    };
    var item = this.schema.findOne({ _id: id });
    this.beforeDelete(req, res, item, del);
}

/**
 * Return the number of items
 */
Rest.prototype.total = function (req, res) {
    this.filteredFind(req, res)
        .count()
        .exec(function onFind(err, total) {
            res.json({total: total});
        });
}

/*******************
 * Private Methods
 *******************/

function formatRespData (code, content) {
    if (typeof code === 'object') {
        content = code,
        code = 1 //0 failure, 1 = success
    }

    return {
        code: code,
        content: content
    }
}

module.exports.Rest = Rest;
