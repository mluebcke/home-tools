'use strict';

angular.module('pApp')
  .controller('UploadCtrl', function ($scope, $http, sessionRepository) {
    $scope.files = [
      { isNew: true,
        done: false
      }
    ];

    $scope.createNewFile = function () {
      $scope.files.unshift({ isNew: true });
    };

    $http.get('/api/storages').then(function (files) {
      files.forEach(function (file) {
        $scope.files.push(file);
      })
    }, function (resp) {
      console.log('Error status: ' + resp.status);
      sessionRepository.logout();
    });
  });
