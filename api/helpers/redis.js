'use strict';

var redis = require('redis');

module.exports = function() {
    return redis.createClient({
        ip: process.env.IP,
        port: 6379
    });
};