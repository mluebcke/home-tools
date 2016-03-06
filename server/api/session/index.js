'use strict';

var express = require('express');
var controller = require('./session.controller');

var router = express.Router();

router.get('/', controller.verify);
router.post('/', controller.login);

module.exports = router;