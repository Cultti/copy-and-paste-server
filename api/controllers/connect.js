'use strict';

var jwt = require('jsonwebtoken');
var cfg = require('config');
var ws = require('../helpers/io.js');
var redis = require('../helpers/redis.js');
var findConnection = require('../helpers/findConnectionById.js');
var timeoutInMs = 10000;

function connectById(req, res) {
    // Get the request ID
    var id = req.swagger.params.id.value;
    // Try find connection
    findConnection(id, function(err, socketId) {
        // If there is an error
        if (err) {
            return res.status(500).json({
                msg: 'Server error'
            });
        }

        // Get the IO
        var io = ws(),
            socket,
            timeout;

        // Check if the socket exists, if not return error
        if (!socketId || !io.sockets.connected[socketId]) {
            return res.status(404).json({
                msg: 'ID not found'
            });
        }

        // Get the socket
        socket = io.sockets.connected[socketId];
        // Send information about connect attemp to client
        socket.emit('api-conected', {
            msg: 'You are now connected to api client'
        });

        // Wait 10 seconds before timeout
        timeout = setTimeout(function() {
            // Clear the listener
            socket.removeAllListeners('api-connected-response');

            // Return error about timeout
            return res.status(408).json({
                msg: 'Web-client did not respond in timely manner'
            });
        }, timeoutInMs);

        // Wait for response from client
        socket.on('api-connected-response', function() {
            // Remove the listener for response
            socket.removeAllListeners('api-connected-response');
            // Clear the timeout waiter
            clearTimeout(timeout);

            // Generate token
            var redisClient, token = jwt.sign({
                socketId: socketId
            }, cfg.get('security.secret'), {
                expiresIn: cfg.get('security.expiresIn')
            });

            // Remove connection from redis
            redisClient = redis();
            redisClient.del('connectionId:' + id);

            // Send response
            res.json({
                msg: 'You are now connected!',
                token: token
            });
        });
    });
}

module.exports = {
    connectById: connectById
};