'use strict';

module.exports = function(app, io) {
    var express = require('express');
    var router = express.Router();
    var redis = require('./redis.js');

    router.post('/send/:id', function(req, res) {
        findConnection(req.params.id, function(err, socketId) {
            if (err) {
                return res.status(500).json({
                    msg: 'Server error'
                });
            }
            else if (!req.body.msg) {
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
                    msg: req.body.msg
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
    });

    router.post('/connect/:id', function(req, res) {
        findConnection(req.params.id, function(err, socketId) {
            if (err) {
                return res.status(500).json({
                    msg: 'Server error'
                });
            }
            else {
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
    });

    function findConnection(id, callback) {
        redis.get('id:' + id, function(err, socketId) {
            if (err) {
                return callback(err);
            }
            else if (socketId) {
                return callback(null, socketId);
            }
            else {
                return callback(null, false);
            }
        });
    }

    app.use('/api', router);
};
