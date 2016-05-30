'use strict';

var io = require('../helpers/io.js')();
var findConnection = require('../helpers/findConnectionById.js');

module.exports = {
    connectById: connectById
};

function connectById(req, res) {
    var id = req.swagger.params.id.value;
    findConnection(id, function(err, socketId) {
        if (err) {
            return res.status(500).json({
                msg: 'Server error'
            });
        }
        else {
            console.log(io);
            if (!socketId || !io.sockets.connected[socketId]) {
                return res.status(404).json({
                    msg: 'ID not found'
                });
            }

            var socket = io.sockets.connected[socketId];
            socket.emit('api-conected', {
                msg: 'You are now connected to api client'
            });

            socket.on('api-connected-response', function(data) {
                socket.removeAllListeners('api-connected-response');
                clearTimeout(timeout);

                res.json({
                    msg: 'You are now connected!'
                });
            });

            // Wait 10 seconds before timeout
            var timeout = setTimeout(function() {
                socket.removeAllListeners('api-connected-response');

                return res.status(408).json({
                    msg: 'Web-client did not respond in timely manner'
                });
            }, 10000);
        }
    });
}