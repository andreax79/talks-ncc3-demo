var _ = require('underscore'), // helper
    mongoose = require('mongoose'),
    Car = mongoose.model('Car'); // model

module.exports.list = list;
module.exports.create = create;
module.exports.read = read;
module.exports.update = update;
module.exports.del = del;
module.exports.total = total;

/**********************
 * Public Interface
 **********************/

function list (req, res) {
    var offset = ~~req.query.offset || 0;
    var limit = ~~req.query.limit || 25;
    Car.find().skip(offset*limit).limit(limit).lean().exec(function (err, users) {
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

function update (req, res) {
    var id = req.params.id;
    Car.findOne({ _id: id }).exec(function (err, car) {
        var newCarData = req.body;
        car = _(car).extend(newCarData);
        car.save(function (err, car) {
            if (err) {
                res.json(formatRespData(0, err));
            } else {
                res.json(formatRespData({}));
            }
        });
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
    Car.find().count().exec(function (err, total) {
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

