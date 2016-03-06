'use strict';

angular.module('pApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngCookies',
  'ui.bootstrap',
  'ngFileUpload',
  'angular-urlsafe-base64'
])
  .config(function ($routeProvider, $locationProvider) {

    function makeInitFunction(options) {
      // we have to use the ['', '', function(...)] notation, because the ng-min doesn't recognize this
      return ['$location', '$route', '$q', 'sessionRepository', function ($location, $route, $q, sessionRepository) {
        if (options.checkSession) {
          if (!sessionRepository.hasValidSession()) {
            $location.path('/login');
            return;
          }
        }
      }];
    }

    $routeProvider
      .when('/upload', {
        templateUrl: 'app/upload/upload.html',
        controller: 'UploadCtrl',
        resolve: {
          init: makeInitFunction({ checkSession: true })
        }
      })
      .when('/login', {
        templateUrl: 'app/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/logout', {
        templateUrl: 'app/logout/logout.html',
        controller: 'LogoutCtrl'
      })
      .otherwise({
        redirectTo: '/upload'
      });

    $locationProvider.html5Mode(true);
  });