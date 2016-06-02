'use strict';

var sinon = require('sinon');

module.exports = function() {
    return {
        sign: sinon.stub().returns('abc')
    };
}