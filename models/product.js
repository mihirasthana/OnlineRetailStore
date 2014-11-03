var connection = require('../util/connectionMgr').getConnection();
exports.getAll = function(){
var selectproductsSQL    = 'SELECT * FROM product';
		connection.query(selectproducts, function(err, results) {

		});	
return null;
};