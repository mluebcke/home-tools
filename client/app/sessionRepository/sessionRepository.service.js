'use strict';

angular.module('pApp')
  .service('sessionRepository', function ($http, $cookies) {
    return {

      login: function (login, password) {
        return $http.post('/api/session', { 'login': login, 'password': password });
      },

      hasValidSession: function () {
        var sessionStr = $cookies.get('ht_session');
        if (!sessionStr) {
          return false;
        }
        try {
          var session = JSON.parse(sessionStr);
          return new Date(session.data.validUntil).getTime() >= new Date().getTime();
        } catch (err) {
          return false;
        }
      }
    }
  });
