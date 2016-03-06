'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');

var USERS = {
  'user1': {
    firstname: 'first',
    lastname: 'last',
    password: 'pwd'
  }
};

var PRIVATE_KEY = uuid.v4();

exports.login = function (req, res) {
  var login = req.body.login;
  var user = USERS[login];

  if (!user || user.password !== req.body.password) {
    return res.status(403).json({});
  }

  var session = {};

  var validUntil = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);
  session.data = {
    firstname: user.firstname,
    lastname: user.lastname,
    validUntil: validUntil
  };

  session.token = jwt.sign(session.data, PRIVATE_KEY);
  var sessionStr = JSON.stringify(session);
  res.cookie('ht_session', sessionStr);
  res.status(200).json(session);
};

exports.verify = function (req, res, callback) {
  try {
    var sessionStr = req.cookies['ht_session'];
    var session = JSON.parse(sessionStr);
    var decoded = jwt.verify(session.token, PRIVATE_KEY);
    if (session.data.validUntil !== decoded.validUntil) {
      res.status(401);
      return;
    }
  } catch (err) {
    res.status(401);
    return;
  }
  callback();
};
