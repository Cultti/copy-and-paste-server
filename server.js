'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = new express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.all('/api/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.static('./public'));

require('./app/api.js')(app, io);
require('./app/ws.js')(io);

server.listen(process.env.PORT, process.env.IP, function(cb) {
    console.log('Listening on port ' + process.env.PORT);
});