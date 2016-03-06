'use strict';

angular.module('pApp')
  .controller('NavbarCtrl', function ($scope, $location, sessionRepository) {
    $scope.menu = [ ];

    if (sessionRepository.hasValidSession()) {
      $scope.menu.push({
        'title': 'Upload',
        'link': '/upload'
      });
      $scope.menu.push({
        'title': 'Logout',
        'link': '/logout'
      });
    }

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });