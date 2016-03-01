'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');

var USERS = {
  'user1' : {
    firstname : 'first',
    lastname : 'last',
    password : 'pwd'
  }
};

var PRIVATE_KEY = uuid.v4();

// Get list of users
exports.index = function(req, res) {
  res.json([]);
};

exports.login = function(req, res) {
  var login = req.body.login;
  var user = USERS[login];

  if (!user || user.password !== req.body.password) {
    return res.status(403).json({});
  }

  var validUntil = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);
  var data = {
    validUntil: validUntil
  };

  data.token = jwt.sign(data, PRIVATE_KEY);

  res.status(200).json(data);
};

exports.verify = function(token) {
  var decoded = jwt.verify(token.token, PRIVATE_KEY);
  if (token.validUntil !== decoded.validUnil) {
    throw 'Invalid oken.';
  }
};
