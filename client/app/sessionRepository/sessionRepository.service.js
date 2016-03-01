'use strict';

angular.module('pApp')
  .service('sessionRepository', function ($http) {
    return {
      login: function (login, password) {
        return $http.post('/api/users', { 'login': login, 'password': password });
      }
    }
  });
