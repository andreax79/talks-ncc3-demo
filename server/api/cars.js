var _ = require('underscore'); // helper
var os = require('os');
var fs = require('fs');
var path = require('path');
var gm = require('gm'); // GraphicsMagick for node.js
var mongoose = require('mongoose');
var util = require('util');
var rest = require('./rest');

var Car = function (app) {
    app.post(path + '/upload', upload);
    rest.Rest.call(this, app, '/api/cars', 'Car');
    this.orderBy = "title";
}

util.inherits(Car, rest.Rest);

Car.prototype.filteredFind = function(req, res) {
    var search = req.query.search || "";
    var searchNumber = Number(search) || 0;
    var re = new RegExp(search, 'i');
    return this.schema.find()
        .or([{ 'title': { $regex: re }},
             { 'year':  searchNumber },
             { 'mileage': searchNumber },
             { 'price': searchNumber } ])
}

Car.prototype.beforeUpdate = function(req, res, item, next) {
    delete req.body.imgData;
    if (req.body.imgUploadId == null) {
        next();
    } else {
        var imgPath = path.join("/tmp", sanitize(req.body.imgUploadId));
        if (!fs.existsSync(imgPath)) {
            next();
        } else {
            // Resize the image and encode in base64
            var imageMagick = gm.subClass({ imageMagick: true });
            imageMagick(imgPath).resize(140).write(imgPath, function() {
                fs.readFile(imgPath, function(err, data) {
                    req.body.imgData = "data:image/jpg;base64," + new Buffer(data).toString('base64');
                    next(req.body);
                    // Delete the uploaded file
                    fs.unlink(imgPath);
                });
            });
        }
    }
}

function sanitize(path) {
    return path.replace(/\.\.\//g,'');
}

function upload (req, res)  {
    //console.log(req.files);
    var name = path.basename();
    res.json({imgUploadId: path.basename(req.files.file.path)});
};

module.exports.Car = Car;

