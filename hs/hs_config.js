var request = require('request');
var moment = require('moment');

var lastUpdate = 0;
var configList;
var timeout = 10;
var returnConfig = {};
function RequestInfo(){
	return 'http://dlxm.f3322.net:14200/_sql';
}
module.exports = {
	GetConfigById : function(id){
		console.log(id)
		var configObj;
		//console.log(checkTimeout());
		if(checkTimeout()){
		    lastUpdate = parseInt(moment().format('X')) + timeout;
			updateConfigList(id);
		}
		configObj = getFronConfigList(id);
		//console.log(configObj)
		return configObj;
	},
	GetRequestInfo : function(){
		return RequestInfo();
	}
}

function checkTimeout(){
	var isTimeout = true;
	var now = moment().format('X');
    isTimeout = now > lastUpdate
	return isTimeout;
}

function getFronConfigList(id) {
	var emptyInfo;
	if(configList)
	{
		//console.log(configList)
    	for(var i=0;i<configList.rowcount;i++){
    		if(configList.rows[i][3] == parseInt(id)){
    			for(var j=0;j<configList.cols.length;j++){
    				var name=configList.cols[j];
    				var value=configList.rows[i][j];
    				returnConfig[name]=value; 
    			}
    			emptyInfo = returnConfig;
    		}
    	}
	}
	//console.log(emptyInfo);
	return emptyInfo;
}

function updateConfigList(id){
	var sql = "select hs_desc, hs_name, hs_time, hs_type, hs_url, spm1, spm2, spm3, spm4 from hs_config";
	request({
	    url: RequestInfo(),
	    method: 'Post',
	    headers: {
	        "content-type": "application/json",
	    },
	    body: JSON.stringify({ "stmt": sql })
	}, function(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	if(error){
	    		console.log(error);
	    	}else{
	    		configList = JSON.parse(body);
	    		//console.log(configList)
	    		lastUpdate = parseInt(moment().format('X')) + timeout;
	    		//getFronConfigList(id);
	    	}
	    }else{
			console.log(error);
	    }
	    
	})
}