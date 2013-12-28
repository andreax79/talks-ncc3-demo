// Load the test data to mongodb

var fs = require('fs'),
    mongoose = require('mongoose');

var DATA_FILE = './resources/data.json';

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

    var carSchema = mongoose.Schema({
        date: String, // Date
        desc: String,
        mileage: Number,
        price: Number,
        title: String,
        year: Number,
        imgData: String
    });
    var Car = mongoose.model('Car', carSchema);

    fs.readFile(DATA_FILE, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        } 

        JSON.parse(data).forEach(function (x) {
           //x._id = Number(x.id);
           delete x.id;
           var car = Car(x);
           car.save(function (err, fluffy) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }
           });
        });
        console.log("done");
//        process.exit();

    });

});

