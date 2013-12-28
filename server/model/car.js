var mongoose = require('mongoose');

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

