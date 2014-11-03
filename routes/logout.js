exports.logoutpage = function(req, res){
  req.session.username = null;
  res.render("logout");
};