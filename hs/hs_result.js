var request = require('request');
var moment = require('moment');//时间的中间件
var config = require('./hs_config.js');

module.exports = {
	getlog : function(req, res,next ){
		var isOk;
		var param = req.body;
		var time=Date.now();
		var theresult;
		if (param!=undefined) {
			var sql = "select * from tracklog; ";
			// var sql = "select * from tracklog limit 4; ";

			var strOk = 'ok';
			//console.log(sql);
			request({
			    url: config.GetRequestInfo(),
			    method: 'Post',
			    headers: {
			        "content-type": "application/json",
			    },
			    body: JSON.stringify({ "stmt": sql})
			}, function(error, response, body) {
				
				theresult=response.body;
			  	resEnd(theresult, res);
			});
			
		}else{
			//console.log(req)
		};
	},
}

function resEnd(json, res){
	res.set({'Content-Type':'text/json','Encodeing':'utf8','Connection':'Keep-alive'});
    res.send(json);
}

