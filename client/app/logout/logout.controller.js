'use strict';

angular.module('pApp')
  .controller('LogoutCtrl', function ($scope, $timeout, $location, sessionRepository) {
    sessionRepository.logout();
    $timeout(function() {
      $location.path('/');
    }, 2 * 1000)
  });
