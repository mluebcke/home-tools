'use strict';

angular.module('pApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ngFileUpload',
  'angular-urlsafe-base64'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/login'
      });

    $locationProvider.html5Mode(true);
  });