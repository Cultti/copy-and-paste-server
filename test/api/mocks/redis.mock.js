var redis = require("redis-mock");
var client;

module.exports = function() {
    if(!client) {
        return redis.createClient();
    }

    return client;
};