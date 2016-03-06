'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var base64url = require('base64url');
var Promise = require('bluebird');
var userController = require('../session/session.controller');

var UPLOAD_FOLDER = '/tmp';
var TMP_POSTFIX = '.upl';
var UPLOAD_FILE_PATTERN = new RegExp('(.*)\\.([^.]+)' + TMP_POSTFIX, 'g');

Promise.promisifyAll(fs);

// Get list of storages
exports.index = function (req, res) {
  userController.verify(req, res, function () {
    fs.readdir(UPLOAD_FOLDER, function (err, files) {
      if (err) {
        throw err;
      }

      files = _.filter(files, function (file) {
        return _.endsWith(file, TMP_POSTFIX);
      });

      files = _.map(files, function (file) {
        return mapUploadFile(file);
      });

      res.json(files);
    });
  });
};

exports.getFile = function (req, res) {
  userController.verify(req, res, function () {
    var id = req.params.id;

    fs.readdir(UPLOAD_FOLDER, function (err, files) {
      if (err) {
        throw err;
      }

      files = _.filter(files, function (file) {
        return _.endsWith(file, id + TMP_POSTFIX);
      });

      if (!files.length) {
        return res.json({size: 0});
      }

      res.json(mapUploadFile(files[0]));
    });
  });
};

exports.upload = function (req, res) {
  userController.verify(req, res, function () {
    var id = req.body.id;

    var fileMD = readMDFromId(id);

    var file = req.file;
    var filename = file.originalname;
    var filePath = file.path;

    var tmpPath = UPLOAD_FOLDER + '/' + filename + '.' + id + TMP_POSTFIX;

    fs.readFile(filePath, function (err, data) {
      if (err) {
        throw err;
      }
      fs.appendFile(tmpPath, data, function (err) {
        if (err) {
          throw err;
        }

        var filesize = fs.statSync(tmpPath).size;

        console.info('filesize: ' + filesize + ', exxpected: ' + fileMD.expectedSize);

        if (fileMD.expectedSize === filesize) {
          var targetPath = tmpPath.replace('.' + id + TMP_POSTFIX, '');
          fs.renameSync(tmpPath, targetPath);
          res.status(200).send('OK');
        } else {
          res.status(206).send('OK');
        }
      });
    });
  });
};

function mapUploadFile(file) {
  var filesize = fs.statSync(UPLOAD_FOLDER + '/' + file).size;
  var serverFilename = file.replace(UPLOAD_FILE_PATTERN, '$1');
  var id = file.replace(UPLOAD_FILE_PATTERN, '$2');
  var md = readMDFromId(id);
  return {
    id: id,
    filename: md.filename,
    size: filesize,
    expectedSize: md.expectedSize,
    serverFilename: serverFilename
  };
}

function readMDFromId(id) {
  var parts = base64url.decode(id).split('-');
  return {
    filename: parts[0],
    expectedSize: parseInt(parts[1])
  };
}
