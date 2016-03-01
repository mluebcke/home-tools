'use strict';

angular.module('pApp')
  .controller('LoginCtrl', function ($scope, $location, sessionRepository) {

    $scope.login = function() {
      $scope.error = null;
      sessionRepository.login($scope.nickname, $scope.password).then(function() {
        $location.path('/main');
      }, function(err) {
        $scope.error = err;
      });
    }
  });
