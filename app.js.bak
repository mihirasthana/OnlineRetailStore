var express = require('express');
var mysql = require("./routes/mysqlconnection");
var connection = mysql.createdbConnection();

var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var logout = require('./routes/logout');
var http = require('http');
var path = require('path');
var cache = require('./util/cache');
var app = express();
var CACHE_TIME = 20000;
//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//development only
if ('development' == app.get('env')) {
//	app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);
app.get('/admin',admin.adminpage);
app.get('/logout',logout.logoutpage);

app.use(express.bodyParser());

//Main route sends our HTML file

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});


app.get('/register', function(req, res) {
	res.render("register",{title: "New User Registration"});
});


app.post('/welcome', function(req, res) {
	var connection = mysql.createdbConnection();
	var insertusers ="INSERT INTO amazonusers VALUES ('"+req.body.email+"','"+req.body.pass+"','"+req.body.fname+"','"+req.body.lname+"')";
	console.log(insertquery);

	console.log(req.body.email+req.body.pass+req.body.fname+req.body.lname);
	connection.query(insertusers, function (err, result) {
		console.log("inserted");
	});
	connection.end();
	res.render("welcome");
});



//authenticate username and password
app.post('/authenticate', function (req, res) {
	var connection = mysql.createdbConnection();
	var uname = req.body.username;
	var pswd  = req.body.password;
	console.log("username"+uname+"password:"+pswd);
	if(uname == "admin@amazon.com" && pswd == "password"){res.writeHead(301,{Location:"/admin"});res.end();}		
	var sql="SELECT * FROM amazonusers WHERE username = '"+ uname +"' and password = '"+ pswd+"'";
	console.log(sql);
	var rows = cache.get(sql);
	if(rows == null){
		connection.query(sql, function(err, rows, fields){
			if(!err){
				cache.put(sql,rows,CACHE_TIME)
				login(req,res,rows,uname,pswd);
			}
		})}
	else{
		login(req,res,rows,uname,pswd);
	}
});
function login(req,res,rows,uname,pswd){
			console.log('no of records is '+rows.length);
			req.session.username = uname ;
			if((rows.length == 0)){res.send("Invalid credentials");}
			else{req.session.username = uname;console.log("Username:",uname);
			var selectproductsSQL    = 'SELECT * FROM product';
			var allProducts = cache.get(selectproductsSQL);
			if(allProducts==null) //couldn't get it from the cache, :(, now get it from DB
			{
				connection.query(selectproductsSQL, function(err, results) {
					cache.put(selectproductsSQL,results,CACHE_TIME); //Now that we got updated from DB, save to cache
					res.render("welcome",{"results":results});
				});
			}
			else{
			res.render("welcome",{"results":allProducts});
			}
			}
		}
//addtocart
app.post('/productspage',function (req,res){
	if(req.body.orderqty==""||req.body.orderqty=="undefined"){req.body.orderqty=1;}
	var insert2cart ="insert into cart (prodid,userid,qty) select p.pid,u.userid,'1' from product p,amazonusers u where p.pname like '"+req.body.cpname+"%' and u.username='"+ req.session.username +"'";
	var selectproducts    = 'SELECT * FROM product';
	console.log("req.session.quantity:"+req.session.quantity);
	console.log("insert2cart:"+insert2cart);

	connection.query(insert2cart, function (err, result) {
	console.log("inserted to cart");
	});
	var result = cache.get(selectproducts);
	
	if(!result){
	connection.query(selectproducts, function(err, results) {
		cache.put(selectproducts,results,CACHE_TIME);
	res.render("welcome",{"results":results});
	});
	}else{
		res.render("welcome",{"results":result});
	}
});

//mycart
app.get('/mycart',function (req,res){
	var selectcart   = "select * from product p where p.pid IN (select prodid from cart where userid= (select userid from amazonusers where username='"+ req.session.username +"'))";
	console.log(selectcart);
	var data = cache.get(selectcart);
	if(!data){
	connection.query(selectcart, function(err, results) {
	cache.put(selectcart,results,CACHE_TIME);
	res.render("loadedcart",{"results":results});
	});
	}else{
		res.render("loadedcart",{"results":data});
	}
});

//checkout
app.post('/checkout',function (req,res){
	var grandtotal= req.body.finaltot;
	var totalcartitems= req.body.cartitems;
	console.log("req.body.finaltot:"+req.body.finaltot);
	console.log("grandtotal:"+grandtotal);
	req.session.total=req.body.finaltot;
	res.render("checkout",{"username":req.session.username,"total":req.session.total,"totalitems":totalcartitems});
	});

//order summary
app.post('/ordersummary',function (req,res){
var insert2orders   = "insert into orders(cid,pid,uname,total,qty) select cartid,prodid,\""+req.session.username+"\",'"+req.session.total+"',qty from cart where userid=(select userid from amazonusers where username='"+req.session.username+"')";
var insert2ordersummary="insert into ordersummary(pname,pprice,cqty,total,uname) (select p.pname,p.price,o.qty,o.total,o.uname from product p,orders o where p.pid=o.pid and o.uname='"+req.session.username+"')";
var selectfromorders = "select * from ordersummary where o.uname='"+req.session.username+"'";
var deletefromcart="delete from cart where userid= (select userid from amazonusers where username='"+ req.session.username +"')";
var updateproductqty = "";
var numofitems = req.body.numitem;
console.log("insert2orders:"+insert2orders);
console.log("selectfromorders:"+selectfromorders);
console.log("deletefromcart:"+deletefromcart);
console.log("numofitems:"+numofitems);
connection.query(insert2orders, function (err, result) {
	console.log("inserted to orders");
	});
connection.query(insert2ordersummary, function (err, result) {
	console.log("inserted to ordersummary");
	});
connection.query(deletefromcart, function (err, result) {
	console.log("deleted from cart");
	});
var orderSummItems = cache.get(selectfromorders);
if(!orderSummItems){
	connection.query(selectfromorders, function(err, results) {
	cache.put(selectfromorders,results,CACHE_TIME);
	res.render("ordersummary",{"results":results});
		});
	}
	else{
	res.render("ordersummary",{"results":orderSummItems});	
	}
	}
);

//sort by department 
app.post('/category',function (req,res){
console.log("Category:"+req.body.myDept);
var selectproductdetailsbydept   = "SELECT * FROM product where catname='"+ req.body.myDept +"'";
console.log("selectproductdetailsbydept:"+selectproductdetailsbydept);
var data = cache.get(selectproductdetailsbydept);
if(!data){
connection.query(selectproductdetailsbydept, function(err, results) {
	cache.put(selectproductdetailsbydept,results,CACHE_TIME);
	res.render("welcome",{"results":results});
	});
}
else{
	res.render("welcome",{"results":data});
}
});


//product details
app.get('/productdetail/:name',function (req,res){
console.log(req.params.name);
var selectproductdetails   = "SELECT * FROM product where pname='"+ req.params.name +"'";
console.log(selectproductdetails);

connection.query(selectproductdetails, function(err, results) {
	res.render("productdetails",{"results":results});
	});

});

//remove from cart
app.get('/removeitem/:item',function (req,res){
console.log(req.params.item);
var deleteproductdetails   = "DELETE FROM cart where prodid=(select pid from product where pname='"+ req.params.item +"') and userid = (select userid from amazonusers where username='"+ req.session.username +"')";
console.log("removefromcart"+deleteproductdetails);
connection.query(deleteproductdetails, function(err, results) {
	res.writeHead(301,{Location:"/mycart"});res.end();
	});

});
//addproducts
app.post('/addedproduct',function (req,res){
	var imagelink = "images/products/"+req.body.img;
	var insertintoproduct   = "insert into product (pname,description,quantity,price,img,warranty,catname) values ('"+ req.body.pname +"','"+ req.body.desc+"','"+ req.body.quantity +"','"+ req.body.price +"','"+imagelink+"','"+req.body.warranty+"','"+ req.body.catname+"')";
	console.log(insertintoproduct);
	connection.query(insertintoproduct, function(err, results) {
	res.send("Product Added Successfully");
	});

});


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
