var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = express();



router.get('/log.gif', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/log.gif'));
});
router.get('/t.gif', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/log.gif'));
});
router.get('/ico.png', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/ico.png'));
});


module.exports = router;