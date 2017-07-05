var request = require('request');
var moment = require('moment');//时间的中间件
var config = require('./hs_config.js');

module.exports = {
	logs : function(logsInfo){
		if (typeof logsInfo=='object') {
			return {code:1}
		};
        var isOk;
        var logs=decodeURIComponent(logsInfo);
       
        var url=this.getQueryString(logsInfo,'url');
        if (url!=null) {
            if (this.getQueryString(logs,'pan') !=null) {
                isOk = this.addTrackLog(logs,url);
            }else{
                isOk = this.addPVLog(logs);
            };
        }else{
        };
        return isOk;
    },
	redirectUrl : function(queryInfo){
		var configObj = config.GetConfigById(queryInfo.id);
		var url = "http://www.xiaoman.com?id=0&spm=000.000.000.000";
		if(configObj)
		{
			url = configObj.hs_url+'?id='+configObj.hs_type+'&spm='+configObj.spm1+'.'+configObj.spm2+'.'+configObj.spm3+'.'+configObj.spm4;
		}
		return url;
	},    
	spmlogs : function(req, logsInfo){
		var isOk;
		var configObj = config.GetConfigById(logsInfo.hs_type);
		var noConfigObj = {
			hs_desc: 'nothing',
			hs_name: 'nothing',
		}
		var client_ip = get_client_ip(req);
		var dateTime =  getTime(req);
		if(configObj)
		{
			isOk = addLog(logsInfo, configObj, client_ip, dateTime);
		}
		else
		{
			//isOk = "error";
			isOk = addLog(logsInfo, noConfigObj, client_ip, dateTime);
		}
		return isOk;
	},	

	trackclick : function(req, result){
		var isOk;
		var param = req.body;
		var time=Date.now();
		if (param!=undefined) {
			var sql = "insert into tracklog  (guestid, device,userid,trackid,time,sku,rand) values('"+param.guestid+"','"+param.device+"','"+param.userid+"','"+param.trackid+"','"+param.time+"','"+param.sku+"','"+param.rand+"')";
			var strOk = 'ok';
			console.log(sql);
			request({
			    url: config.GetRequestInfo(),
			    method: 'Post',
			    headers: {
			        "content-type": "application/json",
			    },
			    body: JSON.stringify({ "stmt": sql})
			}, function(error, response, body) {
			    if (!error && response.statusCode == 200) {
			    	if(error){
			    		strOk = error;
			    		console.log(error);
			    	}
			    }else{
			    	strOk = error;
					console.log(error);
			    }
			    return strOk;
			});
			res={"code": "0000","message": "success" };
			return res;
		}else{
			//console.log(req)
		};
		// jsonWrite(res, result,err);
	},
	addPVLog:function(logs){
		var  guestid=this.getQueryString(logs,'u');
		//var  userid=this.getQueryString(logs,'u2');
		var  browser=this.getQueryString(logs,'b');
		var  browser_ver=this.getQueryString(logs,'bVer');
		var  url=this.getQueryString(logs,'url');
		var  rand=this.getQueryString(logs,'rand');
		var  time=Date.now();

		var sql = "insert into pageviewlog  (guestid,browser,browser_ver, rand,time,hs_url) values('"+guestid+"','"+browser+"','"+browser_ver+"','"+rand+"','"+time+"','"+url+"') ";
		var strOk = 'ok';
		 console.log(sql);
		request({
		    url: config.GetRequestInfo(),
		    method: 'Post',
		    headers: {
		        "content-type": "application/json",
		    },
		    body: JSON.stringify({ "stmt": sql})
		}, function(error, response, body) {
		    if (!error && response.statusCode == 200) {
		    	if(error){
		    		strOk = error;
		    		console.log(error);
		    	}
		    }else{
		    	strOk = error;
				console.log(error);
		    }
		    return strOk;
		});
		return strOk;
	},	

	addTrackLog:function(logs,url){
		var  guestid=this.getQueryString(logs,'u');
		var  ref=this.getQueryString(logs,'r2');
		var  browser=this.getQueryString(logs,'b');
		var  browser_ver=this.getQueryString(logs,'bVer');
		var  clicktag=this.getQueryString(logs,'pan');
		var  domtree=this.getQueryString(logs,'tp');
		var  rand=this.getQueryString(logs,'rand');
		var  time=Date.now();

		var sql = "insert into tracklog_web  (guestid,browser,browser_ver, clicktag,time,hs_url,rand) values('"+guestid+"','"+browser+"','"+browser_ver+"','"+clicktag+"','"+time+"','"+url+"','"+rand+"') ";
		var strOk = 'ok';
		console.log(sql);
		request({
		    url: config.GetRequestInfo(),
		    method: 'Post',
		    headers: {
		        "content-type": "application/json",
		    },
		    body: JSON.stringify({ "stmt": sql})
		}, function(error, response, body) {
		    if (!error && response.statusCode == 200) {
		    	if(error){
		    		strOk = error;
		    		console.log(error);
		    	}
		    }else{
		    	strOk = error;
				console.log(error);
		    }
		    return strOk;
		});
		return strOk;
	},
	getQueryString:function (url,name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = url.substr(1).match(reg);
	    if (r != null) return unescape(r[2]); return null;
    }
}



function addLog(logsInfo, configObj, client_ip, dateTime){
	var sql = "insert into hs_history  (c_uuido, device, hs_desc, hs_name, hs_type, hs_url, ip_address, spm, spm1, spm2, spm3, spm4, time) values('"+logsInfo.c_uuido+"','"+logsInfo.device+"','"+configObj.hs_desc+"','"+configObj.hs_name+"','"+logsInfo.hs_type+"','"+decodeURIComponent(logsInfo.hs_url)+"','"+client_ip+"','"+logsInfo.spm+"','"+logsInfo.spm1+"','"+logsInfo.spm2+"','"+logsInfo.spm3+"','"+logsInfo.spm4+"','"+dateTime+"') ";
	var strOk = 'ok';
	request({
	    url: config.GetRequestInfo(),
	    method: 'Post',
	    headers: {
	        "content-type": "application/json",
	    },
	    body: JSON.stringify({ "stmt": sql})
	}, function(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	if(error){
	    		strOk = error;
	    		//console.log(error);
	    	}
	    }else{
	    	strOk = error;
			//console.log(error);
	    }
	    return strOk;
	});
	return strOk;
}

var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    return ip;
};

function getTime(req){
	return moment().format('X');
} 