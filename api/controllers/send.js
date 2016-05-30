'use strict';

var io = require('../helpers/io.js')();
var findConnection = require('../helpers/findConnectionById.js');

module.exports = {
    sendById: sendById
};

function sendById(req, res) {
    var id = req.swagger.params.id.value;
    findConnection(id, function(err, socketId) {
        if (err) {
            return res.status(500).json({
                msg: 'Server error'
            });
        }
        else if (!req.body.data) {
            return res.status(400).json({
                msg: 'Message is missing!'
            });
        }
        else {
            if (!socketId || !io.sockets.connected[socketId]) {
                return res.status(404).json({
                    msg: 'ID not found'
                });
            }

            var socket = io.sockets.connected[socketId];
            socket.emit('msg', {
                data: req.body.data
            });

            socket.on('msg-response', function(data) {
                socket.removeAllListeners('msg-response');
                clearTimeout(timeout);

                res.json({
                    msg: 'Message delivered succesfully'
                });
            });

            var timeout = setTimeout(function() {
                socket.removeAllListeners('msg-response');

                return res.status(408).json({
                    msg: 'Web-client did not respond in timely manner'
                });
            }, 10000);
        }
    });
}