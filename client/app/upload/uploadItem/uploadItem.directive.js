'use strict';

angular.module('pApp')
  .directive('uploadItem', function ($base64, Upload, sessionRepository) {
    return {
      templateUrl: 'app/upload/uploadItem/uploadItem.html',
      restrict: 'EA',
      scope: {
        file : '=',
        createNewCallback : '&'
      },
        link: {
          pre: function (scope, element, attrs) {
            var CHUNK_SIZE = '10MB';

            scope.ui = {
              percentage: 0,
              percentageMax: 100
            };

            function calculatePercentage() {
              scope.ui.percentage = (scope.file.size / scope.file.expectedSize) * scope.ui.percentageMax;
            }

            calculatePercentage();

            function upload(file) {
              if (!file) {
                return;
              }

              if (scope.file.isNew) {
                scope.createNewCallback();
                scope.file.isNew = false;
              }

              var id = $base64.urlsafe_encode(file.name + '-' + file.size);

              if (scope.file.id && scope.file.id !== id) {
                alert('Falsche Datei zum Upload ausgewählt! Erwarte Datei \'' + scope.file.filename + '\' (' + scope.file.expectedSize + ' bytes)');
                return;
              }

              Upload.upload({
                url: '/api/storages/',
                resumeSizeUrl: '/api/storages/' + id,
                resumeSizeResponseReader: function(data) {
                  return data.size;
                },
                resumeChunkSize: CHUNK_SIZE,
                data: {
                  id : id,
                  file: file
                }
              }).then(function (resp) {
                scope.file.size = scope.file.expectedSize;
                scope.file.done = true;
              }, function (resp) {
                console.log('Error status: ' + resp.status);
                sessionRepository.logout();
              }, function (evt) {
                if (!scope.file.filename) {
                  scope.file.filename = evt.config.data.file.name;
                }
                if (!scope.file.expectedSize) {
                  scope.file.expectedSize = evt.total;
                }
                scope.file.size = evt.loaded;
              });
            }


            scope.$watch('file', function () {
              calculatePercentage();
            }, true);

            scope.$watch('uploadFile', function(file) {
              upload(file);
            });

          }
        }
    };
  });