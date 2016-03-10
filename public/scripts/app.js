/* global angular, io */
'use strict';

angular.module('app', ['ja.qr'])

.controller('main', ['$scope', '$location', function($scope, $location) {
    var url = $location.protocol() +
        '://' + $location.host() +
        ':' + $location.port();

    var socket = io(url);
    socket.on('connect', function() {
        alert('connection!');
    });
    
    $scope.string = 'testing'

    socket.on('msg', function(data) {
        console.log(data);
        socket.emit('msg-response', {
            msg: 'Data received'
        });
        alert('data');
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
}]);