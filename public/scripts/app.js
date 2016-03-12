/* global angular, io */
'use strict';

angular.module('app', ['ja.qr'])

.controller('main', ['$scope', '$location', function($scope, $location) {
    var url = $location.protocol() +
        '://' + $location.host() +
        ':' + $location.port();

    $scope.string = "test";

    var socket = io(url);
    socket.on('connect', function() {
        alert('connection!');
    });

    socket.on('msg', function(msg) {
        
        msg.seq = $scope.seq++;
        
        $scope.messages.push(msg);
        $scope.$digest();
        
        socket.emit('msg-response', {
            msg: 'Data received'
        });
    });

    socket.on('registered', function(data) {
        console.log(data);
        $scope.id = data.id;
        $scope.socketId = data.socketId;
    });

    socket.on('api-conected', function(data) {
        $scope.connected = true;
        $scope.$digest();

        socket.emit('api-connected-response', {
            msg: 'Verified'
        });
    });

    socket.on('disconnect', function() {
        alert('disconnection!');
    });
    
    $scope.testClick = function() {
        alert('CLICKED!!1');
    };

    $scope.messages = [];
    $scope.seq = 0;
}]);