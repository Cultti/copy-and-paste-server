var should = require('should');
var rewire = require('rewire');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var controller, req, res;

var ioMock = require('../mocks/io.mock.js');

describe('Connect controller', function() {
    beforeEach(function() {
        controller = rewire('../../../api-cov/controllers/connect');
        
        controller.__set__('ws', ioMock);
        
        req = httpMocks.createRequest({
            swagger: {
                params: {
                    id: {
                        value: 'abc'
                    }
                }
            }
        });
        res = httpMocks.createResponse();
    });

    it('should try find connection by id', function(done) {
        var findConnection = sinon.spy();
        controller.__set__('findConnection', findConnection);

        controller.connectById(req, res);

        findConnection.calledOnce.should.be.ok();
        findConnection.calledWith('abc').should.be.ok();

        done();
    });

    it('should return 500 status if find connection by id returns error', function(done) {
        // Rewire the findConnection call to fail
        controller.__set__('findConnection', function(id, callback) {
            callback('Error with finding id');
        });
        
        controller.connectById(req, res);
        
        // Get response data
        var data = JSON.parse(res._getData());
        
        // Do the should
        data.should.have.property('msg');
        data.msg.should.equal('Server error');
        res.statusCode.should.equal(500);
        
        // Done
        done();
    });
})