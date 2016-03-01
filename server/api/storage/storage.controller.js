'use strict';

var _ = require('lodash');
var sha1 = require('sha1');
var fs = require('fs-extra');
var base64url = require('base64url');

var Promise = require("bluebird");

var UPLOAD_FOLDER = '/tmp';
var TMP_POSTFIX = '.upl';
var UPLOAD_FILE_PATTERN = new RegExp('(.*)\\.([^.]+)' + TMP_POSTFIX, 'g');

Promise.promisifyAll(fs);

// Get list of storages
exports.index = function (req, res) {
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
};

exports.getFile = function (req, res) {
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
};

exports.upload = function (req, res) {
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
};


exports.upload_ = function (req, res) {
  var patch = req.method === 'PATCH';
  var contentRange = parseContentRange(req.get('Content-Range'));

  var clientFilename = req.body.filename;

  var file = req.file;
  var filename = file.originalname;
  var filePath = file.path;

  var id = base64url(clientFilename + '-' + contentRange.length);
  var tmpPath = UPLOAD_FOLDER + '/' + filename + '.' + id + TMP_POSTFIX;

  var config = {};
  if (patch) {
    config.flags = 'a';
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      throw err;
    }
    fs.appendFile(tmpPath, data, function (err) {
      if (err) {
        throw err;
      }
      if (!patch || contentRange.isDone()) {
        var targetPath = tmpPath.replace('.' + id + TMP_POSTFIX, '');
        fs.renameSync(tmpPath, targetPath);
        res.status(200).send('OK');
      } else {
        res.status(206).send('OK');
      }
    });
  });
};

function mapUploadFile(file) {
  var filesize = fs.statSync(UPLOAD_FOLDER + '/' + file).size;
  var serverFilename = file.replace(UPLOAD_FILE_PATTERN, '$1');
  var id = file.replace(UPLOAD_FILE_PATTERN, '$2');
  var md = readMDFromId(id);
  return {
    id : id,
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
    expectedSize : parseInt(parts[1])
  };
}

function parseContentRange(raw) {
  /*
   . The first 500 bytes:
   bytes 0-499/1234
   . The second 500 bytes:
   bytes 500-999/1234
   . All except for the first 500 bytes:
   bytes 500-1233/1234
   . The last 500 bytes:
   bytes 734-1233/1234
   */
  var parts = null;
  if (raw) {
    parts = /bytes (\d+)-(\d+)\/(\d+)/g.exec(raw);
  }
  var match = parts && parts.length;
  return {
    start: match ? parseInt(parts[1]) : -1,
    end: match ? parseInt(parts[2]) : -1,
    length: match ? parseInt(parts[3]) : -1,
    isDone: function () {
      return !match || this.end === this.length;
    }
  };
}
