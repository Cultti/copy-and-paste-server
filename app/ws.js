module.exports = function(io) {
    var redis = require('./redis.js');

    io.on('connection', function(socket) {
        var id = generateId();
        
        redis.set('id:' + id, socket.id);
        redis.set('socketId:' + socket.id, id);
        
        socket.emit('registered', {id: id, socketId: socket.id});
        
        // Socket events
        socket.on('disconnect', function() {
            redis.del('connection:' + id, 'socketId:' + socket.id);
        });
    });

    function generateId() {
        return Math.random().toString(36).substr(2, 16);
    }
};
