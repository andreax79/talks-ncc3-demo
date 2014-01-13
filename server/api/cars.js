var _ = require('underscore'); // helper
var os = require('os');
var fs = require('fs');
var path = require('path');
var gm = require('gm'); // GraphicsMagick for node.js
var mongoose = require('mongoose');
var utls = require('utils');

module.exports.upload = upload;

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

    app.post(path + '/upload', upload);
    
    var instance = this;
    app.get(path + '', function(req,res) { return instance.list(req,res); });
    app.get(path + '/total', function(req,res) { return instance.total(req,res); }); //placement matters
    app.get(path + '/:id',  function(req,res) { return instance.read(req,res); }); //sometimes called 'show'
    app.post(path, function(req,res) { return instance.create(req,res); });
    app.put(path + '/:id', function(req,res) { return instance.update(req,res); });
    app.del(path + '/:id', function(req,res) { return instance.del(req,res); });
}; 

module.exports.Rest = Rest;

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
    this.schema.find().skip(offset*limit)
        .limit(limit)
        .lean()
        .sort(orderBy)
        .or([{ 'title': { $regex: re }},
             { 'year':  searchNumber },
             { 'mileage': searchNumber },
             { 'price': searchNumber } ])
//      .or([{ 'title': { $regex: re }}, { 'year':  search }, { 'mileage': search }, { 'price': search } ])
        .exec(function (err, users) {
            return res.end(JSON.stringify(users));
        });
}

Rest.prototype.create = function(req, res) {
    var newItemData = req.body;
    var newItem = this.schema();
    newItem = _(newItem).extend(newItemData);
    newItem.save(function onSave(err, newItem) {
        if (err) {
            res.json(formatRespData(0, err));
        } else {
            res.json(formatRespData({id: newItem.id}));
        }
    });
}

Rest.prototype.read = function(req, res) {
    var id = req.params.id;
    this.schema.findOne({ _id: id }).lean().exec(function onFindOne(err, item) {
        if (!item)
            res.json(formatRespData(0, "Can't find item with id: " + id));
        else
            res.json(formatRespData(item));
    });
}

Rest.prototype.beforeUpdate = function(req, res, item, next) {
    delete req.body.imgData;
    if (req.body.imgUploadId == null) {
        next();
    } else {
        var imgPath = path.join("/tmp", sanitize(req.body.imgUploadId));
        if (!fs.existsSync(imgPath)) {
            next();
        } else {
            console.log(req.body.imgUploadId);
            // Resize the image and encode in base64
            var imageMagick = gm.subClass({ imageMagick: true });
            imageMagick(imgPath).resize(140).write(imgPath, function() {
                fs.readFile(imgPath, function(err, data) {
                    req.body.imgData = "data:image/jpg;base64," + new Buffer(data).toString('base64');
            console.log(req.body.imgData)
                    next(req.body);
                    // Delete the uploaded file
                    fs.unlink(imgPath);
                });
            });
        }
    }
}

Rest.prototype.update = function(req, res) {
    var id = req.params.id;
    var instance = this;
    this.schema.findOne({ _id: id }).exec(function onFindOne(err, item) {
        function saveItem() {
            console.log(req.body.imgData)
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

Rest.prototype.del = function(req, res) {
    var id = req.params.id;
    //var item = this.schema.findOne({ _id: id });
    this.schema.remove({ _id: id }, function onRemove(err) {
        if (err) {
            res.json(formatRespData(0, err));
        } else {
            res.json(formatRespData({}));
        };
    });
}

Rest.prototype.total = function (req, res) {
    var search = req.query.search || "";
    var re = new RegExp(search, 'i');
    var searchNumber = Number(search) || 0;
    this.schema.find()
        .or([{ 'title': { $regex: re }},
             { 'year':  searchNumber },
             { 'mileage': searchNumber },
             { 'price': searchNumber } ])
        .count()
        .exec(function onFind(err, total) {
            res.json({total: total});
        });
}

function upload (req, res)  {
    //console.log(req.files);
    var name = path.basename();
    res.json({imgUploadId: path.basename(req.files.file.path)});
};

/*******************
 * Private Methods
 *******************/

function sanitize(path) {
    return path.replace(/\.\.\//g,'');
}

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

