exports.adminpage = function(req, res){
  res.render("admin",{"uname":req.session.username});
};