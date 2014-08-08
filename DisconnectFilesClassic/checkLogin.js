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
    return "NWSsPhpyHixC5+W1AcV57J4RPFIxSZD+95LHJ7FZumQ=";
    // TODO: genkey <--- require('crypto')
}