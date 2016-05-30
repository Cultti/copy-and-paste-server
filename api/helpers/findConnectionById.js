'use strict';

var redis = require('./redis.js');

module.exports = function findConnection(id, callback) {
    redis.get('connectionId:' + id, function(err, socketId) {
        if (err) {
            return callback(err);
        }
        else if (socketId) {
            return callback(null, socketId);
        }
        else {
            return callback(null, false);
        }
    });
};