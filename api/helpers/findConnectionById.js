'use strict';

var redis = require('./redis.js');

module.exports = function findConnection(id, callback) {
    redis.get('connectionId:' + id, function(err, socketId) {
        if (err) {
            return callback(err);
        }
        if (socketId) {
            return callback(null, socketId);
        }

        return callback(null, false);
    });
};