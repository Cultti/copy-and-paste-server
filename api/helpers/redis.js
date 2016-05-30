var redis = require('redis').createClient({
    ip: process.env.IP,
    port: 6379
});

module.exports = redis;