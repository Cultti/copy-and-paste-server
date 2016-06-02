var should = require('should');
var rewire = require('rewire');
var sinon = require('sinon');
var controller;

var ioMock = require('../mocks/io.mock.js');

describe('Connect controller', function() {
    beforeEach(function() {
       controller = rewire('../../../api/controllers/connect');
       
       controller.__set__('ws', ioMock);
    });
    
    it('should try find connection by id', function(done) {
        var findConnection = sinon.spy();
        controller.__set__('findConnection', findConnection);
        
        controller.connectById({
            swagger: {
                params: {
                    id: {
                        value: 'abc'
                    }
                }
            }
        }, null);
        
        findConnection.calledOnce.should.be.ok();
        findConnection.calledWith('abc').should.be.ok();
        
        done();
    });
})