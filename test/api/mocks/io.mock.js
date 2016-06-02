'use strict';
var sinon = require('sinon');

module.exports = function() {
    return {
        sockets: {
            connected: {
                abc: {
                    emit: sinon.spy(),
                    on: sinon.spy(),
                    removeAllListeners: sinon.spy()
                }
            }
        }
    };
}