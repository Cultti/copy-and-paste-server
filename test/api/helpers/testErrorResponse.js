'use strict';
var should = require('should');

module.exports = function(response, code) {
    // Get response data
    var data = JSON.parse(response._getData());

    // Do the should
    data.should.have.property('msg');
    response.statusCode.should.equal(code);
};