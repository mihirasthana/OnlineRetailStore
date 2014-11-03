exports.adminpage = function(req, res){
	var mysql = require("./mysqlconnection");
	var connection = mysql.createdbConnection();
	var selectquery = "select  catname from cat";
	connection.query(selectquery, function (err, result) {
    console.log("selectquery"+selectquery);
	res.render("admin",{"result":result,"uname":req.session.username});
	});
};