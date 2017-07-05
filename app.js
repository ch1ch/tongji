var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var favicon = require('serve-favicon');
var fs = require('fs');
var logger = require('morgan');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var morgan = require('morgan');
var rfs = require('rotating-file-stream');
var FileStreamRotator = require('file-stream-rotator');
var hs = require('./hs/hs_biz');
var log = require('./routers/log');
var api = require('./routers/api');
var port=3020;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('util', path.join(__dirname, 'util'));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Connection",' Keep-alive')
    res.header("X-Powered-By",' 3.2.1')
    //res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
 app.use(express.static('util'));

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


router.get('/tongji', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index1.html'));
});

router.get('/result', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index2.html'));
});

//日志
var logDirectory = path.join(__dirname, '../log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/%DATE%.log',
    frequency: 'daily',
    verbose: false
});

app.use(morgan('combined', {stream: accessLogStream}))
//combined

// 带write方法的对象
var dbStream = {
  write: function(line){
    saveToDatabase(line); 
  }
};

morgan.format('geturl', ':url');
app.use(morgan('geturl', {stream: dbStream}));

function saveToDatabase(line){
  hs.logs(line);
}

app.use('/', router);
app.use('/log', log);
app.use('/api', api);

var server = require('http').Server(app);
server.listen(port, function () {
  console.log('server listening on port ',port);
});