'use strict';

var express = require('express');
var controller = require('./storage.controller');
var upload = require('multer')({ dest: '/tmp/' });

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.getFile);

router.post('/', upload.single('file'), controller.upload);
router.patch('/', upload.single('file'), controller.upload);

module.exports = router;