module.exports = function (req, res, next) {
  if ( (req.session.user && req.session.user.username && req.session.user.granted)) {
    next();
  } else {
    res.status(401).render("authError", { code: 401 });
  }
}
