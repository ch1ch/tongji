var request = require('request');
var moment = require('moment');

var lastUpdate = 0;
var configList;
var timeout = 10;
var returnConfig = {};
function RequestInfo(){
	return 'http://172.16.0.178:4200/_sql';
}
module.exports = {
	GetConfigById : function(id){
		var configObj;
		//console.log(checkTimeout());
		if(checkTimeout()){
		    lastUpdate = parseInt(moment().format('X')) + timeout;
			updateConfigList(id);
		}
		configObj = getFronConfigList(id);
		//console.log(configObj);
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
    	for(var i=0;i<configList.rowcount;i++){
    		if(configList.rows[i][2] == parseInt(id)){
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
	var sql = "select * from hs_config";
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
	    		lastUpdate = parseInt(moment().format('X')) + timeout;
	    		//getFronConfigList(id);
	    	}
	    }else{
			console.log(error);
	    }
	    
	})
}