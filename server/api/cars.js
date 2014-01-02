var _ = require('underscore'), // helper
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    gm = require('gm'), // GraphicsMagick for node.js
    mongoose = require('mongoose'),
    Car = mongoose.model('Car'); // model

module.exports.list = list;
module.exports.create = create;
module.exports.read = read;
module.exports.update = update;
module.exports.del = del;
module.exports.total = total;
module.exports.upload = upload;

/**********************
 * Public Interface
 **********************/

function list (req, res) {
    var offset = ~~req.query.offset || 0;
    var limit = ~~req.query.limit || 25;
    var orderBy = req.query.orderBy || "title";
    var reverse = req.query.reverse == "true";
    if (reverse)
        orderBy = "-" + orderBy;
    var search = req.query.search || "";
    var searchNumber = Number(search) || 0;
    var re = new RegExp(search, 'i');
    Car.find().skip(offset*limit)
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

function create (req, res) {
    var newCarData = req.body;
    var newCar = Car();
    newCar = _(newCar).extend(newCarData);
    newCar.save(function (err, newCar) {
        if (err) {
            res.json(formatRespData(0, err));
        } else {
            res.json(formatRespData({id: newCar.id}));
        }
    });
}

function read (req, res) {
    var id = req.params.id;
    Car.findOne({ _id: id }).lean().exec(function (err, car) {
        if (!car)
            res.json(formatRespData(0, "Can't find car with id: " + id));
        else
            res.json(formatRespData(car));
    });
}

function sanitize(path) {
    return path.replace(/\.\.\//g,'');
}

function update (req, res) {
    var id = req.params.id;
    Car.findOne({ _id: id }).exec(function (err, car) {
 
        function saveCar() {
            car = _(car).extend(newCarData);
            car.save(function (err, car) {
                if (err) {
                    res.json(formatRespData(0, err));
                } else {
                    res.json(formatRespData({}));
                }
            });
        }

        var newCarData = req.body;
        delete newCarData.imgData;
        if (newCarData.imgUploadId == null) {
            saveCar();
        } else {
            var imgPath = path.join("/tmp", sanitize(newCarData.imgUploadId));
            if (!fs.existsSync(imgPath)) {
                saveCar();
            } else {
                // Resize the image and encode in base64
                var imageMagick = gm.subClass({ imageMagick: true });
                imageMagick(imgPath).resize(140).write(imgPath, function() {
                    fs.readFile(imgPath, function(err, data) {
                        newCarData.imgData = "data:image/jpg;base64," + new Buffer(data).toString('base64');
                        saveCar();
                        // Delete the uploaded file
                        fs.unlink(imgPath);
                    });
                });
            }
        }

    });
}

function del (req, res) {
    var id = req.params.id;
    var car = Car.findOne({ _id: id });
    Car.remove({ _id: id }, function (err) {
        if (err) {
            res.json(formatRespData(0, err));
        } else {
            res.json(formatRespData({}));
        };
    });
}

function total (req, res) {
    var search = req.query.search || "";
    var re = new RegExp(search, 'i');
    var searchNumber = Number(search) || 0;
    Car.find()
        .or([{ 'title': { $regex: re }},
             { 'year':  searchNumber },
             { 'mileage': searchNumber },
             { 'price': searchNumber } ])
        .count()
        .exec(function (err, total) {
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

