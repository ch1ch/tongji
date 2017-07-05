//路由控制
var biz = require('../hs/hs_biz.js');
var logresult = require('../hs/hs_result.js');
var linkUrl = require('url');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = module.exports = express();

router.post('/clicktrack.api', urlencodedParser,function(req, res){
	var logsInfo  = req.body;
	//console.log(logsInfo);
	if (logsInfo==undefined) {
		var result={'code':'0001','msg':'error'};
		resEnd(result, res);
	}else{
		var result = biz.trackclick(req,res);
		resEnd(result, res);
	};
});

router.post('/getresult.api', urlencodedParser,function(req, res,next){
	var logsInfo  = req.body;
	//console.log(logsInfo);
	var result;
	logresult.getlog(req,res,next);
	
	// console.log(res);
});

router.get('/channel',function(req, res){
	var queryInfo =  linkUrl.parse(req.url,true).query;
	//console.log(queryInfo);
	var url = biz.redirectUrl('/result');
	res.redirect(url);
});

router.post('/logs',function(req, res){
	var logsInfo  = req.body;
	//console.log(logsInfo);
	//var queryInfo =  linkUrl.parse(req.url,true).query;
	var isOk = biz.spmlogs(req, logsInfo);
	resEnd(logsInfo, res);
});

module.exports = router;

function resEnd(json, res){
	res.set({'Content-Type':'text/json','Encodeing':'utf8','Connection':'Keep-alive','Keep-Alive':'timeout=60'});
    res.send(json);
}