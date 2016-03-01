'use strict';

angular.module('pApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.files = [
      { isNew : true,
        done : false
      }
    ];

    $scope.createNewFile = function() {
      $scope.files.unshift({ isNew : true });
    };

    $http.get('/api/storages').success(function(files) {
      files.forEach(function(file) {
        $scope.files.push(file);
      });
    });
  });
