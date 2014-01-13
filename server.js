if (!process.env.NODE_ENV)
    process.env.NODE_ENV='development'

var express = require('express'); // web framework
var http = require('http');
var fs = require('fs');
var path = require('path');
var reload = require('reload'); // reload browser when codechanges
var colors = require('colors'); // get colors in console
var db = require('./server/model/db');
var cars = require('./server/api/cars');

var app = express();
app.use(express.bodyParser());

var clientDir = path.join(__dirname, 'client');

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser()) ;
  app.use(app.router) ;
  app.use(express.static(clientDir));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.sendfile(path.join(clientDir, 'index.html'))
});
app.get('/new', function(req, res) {
  res.sendfile(path.join(clientDir, 'index.html'))
});
app.get('/edit/:id', function(req, res) {
  res.sendfile(path.join(clientDir, 'index.html'))
});

var car = new cars.Car(app);

var server = http.createServer(app);

reload(server, app, 1500); // client side refresh time in milliseconds

server.listen(app.get('port'), function(){
  console.log("Web server listening in %s on port %d",
    colors.red(process.env.NODE_ENV), app.get('port'));
});


