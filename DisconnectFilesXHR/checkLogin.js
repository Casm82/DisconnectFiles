exports.authD = function (req, res, next) {
  if (! (req.session.user && req.session.user.granted)) {
	console.log("authD: %j, ip: %s", req.session, req.ip);
    res.render("authError", 
    {
        code: "notLoggedIn",
        session: req.session
    });
  } else {
    next();
  }
}

exports.genkey = function () {
    var crypto = require('crypto'); 
    return crypto.randomBytes(32).toString("base64");
}