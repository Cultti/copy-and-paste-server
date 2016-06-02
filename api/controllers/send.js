'use strict';

var io = require('../helpers/io.js')();

function sendById(req, res) {
    // Get the socket ID from user(Bearer token)
    var socketId = req.user.socketId,
        socket,
        timeout;

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
    socket = io.sockets.connected[socketId];

    // Send message to the client
    socket.emit('msg', {
        data: req.body.data
    });

    // Wait for timeout
    timeout = setTimeout(function() {
        // Remove listener
        socket.removeAllListeners('msg-response');

        // Send error about timeout
        return res.status(408).json({
            msg: 'Web-client did not respond in timely manner'
        });
    }, 10000);

    // Wait for ack from client
    socket.on('msg-response', function() {
        // Clear the ack listener
        socket.removeAllListeners('msg-response');
        // Clear timeout
        clearTimeout(timeout);

        // Send response that message was delivered succesfully
        res.json({
            msg: 'Message delivered succesfully'
        });
    });
}

module.exports = {
    sendById: sendById
};