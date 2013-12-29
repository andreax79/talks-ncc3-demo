var mongoose = require('mongoose');

var carSchema = mongoose.Schema({
    date: String, // Date
    desc: String,
    mileage: { type: Number, index: true },
    price: { type: Number, index: true },
    title: { type: String, index: true },
    year: { type: Number, index: true },
    imgData: String
});

var Car = mongoose.model('Car', carSchema);

