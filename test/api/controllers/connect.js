var should = require('should');
var rewire = require('rewire');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
var findConnectionByIdMock = require('../mocks/findConnectionById.mock');
var ioMock = require('../mocks/io.mock');
var redisMock = require('../mocks/redis.mock');
var jwtMock = require('../mocks/jwt.mock');
var testErrorResponseHelper = require('../functions/testErrorResponse');
var controller, req, ioStub, io, jwt, redis;

describe('Connect controller', function() {
    beforeEach(function() {
        controller = rewire('../../../api-cov/controllers/connect');
        io = ioMock();
        jwt = jwtMock();
        ioStub = sinon.stub().returns(io);
        redis = redisMock();

        controller.__set__('ws', ioStub);
        controller.__set__('findConnection', findConnectionByIdMock);
        controller.__set__('redis', sinon.stub().returns(redis));
        controller.__set__('jwt', jwt);

        req = httpMocks.createRequest({
            swagger: {
                params: {
                    id: {
                        value: 'abc'
                    }
                }
            }
        });
    });
    
    afterEach(function() {
        redis.quit();
    });

    it('should try find connection by id', function(done) {
        var findConnection = sinon.spy();
        var res = httpMocks.createResponse();
        controller.__set__('findConnection', findConnection);

        controller.connectById(req, res);

        findConnection.calledOnce.should.be.ok();
        findConnection.calledWith('abc').should.be.ok();

        done();
    });

    it('should return 500 status if find connection by id returns error', function(done) {
        var res = httpMocks.createResponse();
        // Rewire the findConnection call to fail
        controller.__set__('findConnection', function(id, callback) {
            callback('Error with finding id');
        });

        controller.connectById(req, res);

        testErrorResponseHelper(res, 500);

        // Done
        done();
    });

    it('should try get socket.io server from io', function(done) {
        var res = httpMocks.createResponse();
        // Make the call
        controller.connectById(req, res);

        // Do the should
        ioStub.calledOnce.should.be.ok();

        done();
    });

    it('should return 404 if nothing is found by findConnection', function(done) {
        var res = httpMocks.createResponse();
        // Rewire the findConnection return false
        controller.__set__('findConnection', function(id, callback) {
            callback(null, false);
        });

        // Make the call
        controller.connectById(req, res);

        testErrorResponseHelper(res, 404);

        done();
    });

    it('should return 404 if connection is disconnected', function(done) {
        var res = httpMocks.createResponse();
        // Rewire the findConnection return false
        controller.__set__('findConnection', function(id, callback) {
            callback(null, 'notExists');
        });

        // Make the call
        controller.connectById(req, res);

        testErrorResponseHelper(res, 404);

        done();
    });

    it('should emit api-conected message to the socket', function(done) {
        var res = httpMocks.createResponse();
        // Make the call
        controller.connectById(req, res);

        io.sockets.connected['abc'].emit.calledWith('api-conected').should.be.ok();

        done();
    });

    it('should res timeout if client does not answer in specified timelimit', function(done) {
        var res = httpMocks.createResponse();
        // Set timeout for testing
        controller.__set__('timeoutInMs', 0);

        // Make the call
        controller.connectById(req, res);

        setTimeout(function() {
            testErrorResponseHelper(res, 408);
            done();
        }, 0);
    });

    it('should remove all listeners api-connected-response from socket when timeout occurs', function(done) {
        var res = httpMocks.createResponse();
        // Set timeout for testing
        controller.__set__('timeoutInMs', 0);

        // Make the call
        controller.connectById(req, res);

        setTimeout(function() {
            io.sockets.connected['abc'].removeAllListeners
                .calledWith('api-connected-response').should.be.ok();

            done();
        }, 0);
    });

    it('should start listening socket for api-connected-response call', function(done) {
        var res = httpMocks.createResponse();
        // Make the call
        controller.connectById(req, res);

        io.sockets.connected['abc'].on
            .calledWith('api-connected-response').should.be.ok();

        done();
    });

    it('should remove all api-connected-response listeners when gets call', function(done) {
        var res = httpMocks.createResponse();
        io.sockets.connected['abc'].on = function(listener, callback) {
            callback();
        };

        // Make the call
        controller.connectById(req, res);

        io.sockets.connected['abc'].removeAllListeners
            .calledWith('api-connected-response').should.be.ok();

        done();
    });

    it('should generate token', function(done) {
        var res = httpMocks.createResponse();
        io.sockets.connected['abc'].on = function(listener, callback) {
            callback();
        };

        // Make the call
        controller.connectById(req, res);

        jwt.sign.calledOnce.should.be.ok();

        done();
    });

    it('should remove connectionId from redis', function(done) {
        var res = httpMocks.createResponse();
        redis.del = sinon.spy();

        io.sockets.connected['abc'].on = function(listener, callback) {
            callback();
        };

        // Make the call
        controller.connectById(req, res);

        redis.del.calledWith('connectionId:abc').should.be.ok();

        done();
    });

    it('should return 200 response with message and token', function(done) {
        var res = httpMocks.createResponse();
        io.sockets.connected['abc'].on = function(listener, callback) {
            callback();
        };

        // Make the call
        controller.connectById(req, res);
        // Get response data
        var data = JSON.parse(res._getData());

        // Do the should
        data.should.have.property('msg');
        data.should.have.property('token');
        res.statusCode.should.equal(200);
        
        done();
    });
})