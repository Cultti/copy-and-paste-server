'use strict';

var io = require('../helpers/io.js')();
var findConnection = require('../helpers/findConnectionById.js');

module.exports = {
    sendById: sendById
};

function sendById(req, res) {
    // Get the request ID
    var id = req.swagger.params.id.value;

    // Try find connection
    findConnection(id, function(err, socketId) {
        // If there is an error, return
        if (err) {
            return res.status(500).json({
                msg: 'Server error'
            });
        }
        
        // If we are missing data, return error
        if (!req.body.data) {
            return res.status(400).json({
                msg: 'Message is missing!'
            });
        }

        // If the socket is not found or does not exists
        if (!socketId || !io.sockets.connected[socketId]) {
            return res.status(404).json({
                msg: 'ID not found'
            });
        }

        // Get the socket
        var socket = io.sockets.connected[socketId];
        
        // Send message to the client
        socket.emit('msg', {
            data: req.body.data
        });

        // Wait for ack from client
        socket.on('msg-response', function(data) {
            // Clear the ack listener
            socket.removeAllListeners('msg-response');
            // Clear timeout
            clearTimeout(timeout);

            // Send response that message was delivered succesfully
            res.json({
                msg: 'Message delivered succesfully'
            });
        });

        // Wait for timeout
        var timeout = setTimeout(function() {
            // Remove listener
            socket.removeAllListeners('msg-response');

            // Send error about timeout
            return res.status(408).json({
                msg: 'Web-client did not respond in timely manner'
            });
        }, 10000);
    });
}