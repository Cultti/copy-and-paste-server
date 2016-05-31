'use strict';

var SwaggerExpress = require('swagger-express-mw');
var expressJwt = require("express-jwt");
var cfg = require('config');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
require('./api/helpers/io.js')(io);
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: { // Add bearer security handler
    bearer: function(req, authOrSecDef, scopesOrApiKey, cb) {
      expressJwt({
        secret: cfg.get('security.secret')
      })(req, cb, cb);
    }
  }
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) {
    throw err;
  }

  // install middleware
  swaggerExpress.register(app);

  app.use(express.static('./public'));

  var port = process.env.PORT || 10010;
  var ip = process.env.IP || "0.0.0.0";
  server.listen(port, ip);
});
