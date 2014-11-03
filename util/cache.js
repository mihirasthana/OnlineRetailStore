var cache = {}
var crypto = require('crypto');

exports.put = function(key,value,timeToKeep){
	//return null;
	var oKey = key;
	var key = crypto.createHash('md5').update(key).digest('hex');
	console.log('caching: '+key+' at '+currTime());

	var old = cache[key];
	if(old){
		clearTimeout(old.timeout);
	}
	var expireTime = timeToKeep + currTime();
	var record = {value:value,expireTime : expireTime};

	var timeout = setTimeout(function() {
		exports.del(oKey);
	},timeToKeep);

	record.timeout = timeout;

	cache[key] = record;
}

exports.clear = function() {
	cache = {};
}

exports.get = function(key) {
		//return null;
		var oKey = key;
		var key = crypto.createHash('md5').update(key).digest('hex');
var rec = cache[key];
	if(typeof rec != "undefined"){
		if(rec.expireTime>=currTime()){
			console.log("Returned "+key+" from cache at "+ currTime());
			return rec.value;
		}
		else
			exports.del(oKey);
	}
	return null;
}

exports.del = function(key) {
	var key = crypto.createHash('md5').update(key).digest('hex');
	 delete cache[key];
	 console.log("Deleted from cache "+key+" at "+currTime());
}

function currTime(){
	return (new Date).getTime();
}