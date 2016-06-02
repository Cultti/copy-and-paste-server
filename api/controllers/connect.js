'use strict';

var jwt = require('jsonwebtoken');
var cfg = require('config');
var ws = require('../helpers/io.js');
var redis = require('../helpers/redis.js');
var findConnection = require('../helpers/findConnectionById.js');

module.exports = {
    connectById: connectById
};

function connectById(req, res) {
    // Get the request ID
    var id = req.swagger.params.id.value;
    // Get io
    var io = ws();
    // Try find connection
    findConnection(id, function(err, socketId) {
        // If there is an error
        if (err) {
            return res.status(500).json({
                msg: 'Server error'
            });
        }

        // Check if the socket exists, if not return error
        if (!socketId || !io.sockets.connected[socketId]) {
            return res.status(404).json({
                msg: 'ID not found'
            });
        }

        // Get the socket
        var socket = io.sockets.connected[socketId];
        // Send information about connect attemp to client
        socket.emit('api-conected', {
            msg: 'You are now connected to api client'
        });

        // Wait for response from client
        socket.on('api-connected-response', function(data) {
            // Remove the listener for response
            socket.removeAllListeners('api-connected-response');
            // Clear the timeout waiter
            clearTimeout(timeout);

            // Generate token
            var token = jwt.sign({
                socketId: socketId
            }, cfg.get('security.secret'),
            {
                expiresIn: cfg.get('security.expiresIn')
            });
            
            // Remove connection from redis
            redis.del('connectionId:' + id);

            // Send response
            res.json({
                msg: 'You are now connected!',
                token: token
            });
        });

        // Wait 10 seconds before timeout
        var timeout = setTimeout(function() {
            // Clear the listener
            socket.removeAllListeners('api-connected-response');

            // Return error about timeout
            return res.status(408).json({
                msg: 'Web-client did not respond in timely manner'
            });
        }, 10000);
    });
}