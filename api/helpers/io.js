'use strict';
var server;

module.exports = function(io) {
    if(server) {
        return server;
    }
    
    server = io;
    
    var redis = require('./redis.js');

    io.on('connection', function(socket) {
        var id = generateId();
        
        redis.set('connectionId:' + id, socket.id);
        
        socket.emit('registered', {id: id, socketId: socket.id});
        
        // Socket events
        socket.on('disconnect', function() {
            redis.del('connectionId:' + id);
        });
    });

    function generateId() {
        return Math.random().toString(36).substr(2, 16);
    }
    
    return server;
};