exports.createdbConnection = function() {
	var mysql = require('mysql');

	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'amazon'
	});
	
	connection.connect(function(error) {
		if(!error) {
			console.log("Connected!!!");
		} else{
			console.log("ISSUE:"+error);
		}
	});
	return connection;
};


exports.getConnection = function(){
	return exports.createdbConnection();
}