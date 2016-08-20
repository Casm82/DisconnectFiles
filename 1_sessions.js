"use strict";
module.exports = function(app){
  let checkAuth = require("./checkAuth");
  let config = require("./settings.json")
  let ActiveDirectory = require("activedirectory");
  let ad = new ActiveDirectory(config.ldapConfig);

  //////////////////////////////////////////////////////////////////////////////////////////
  app.post("/session", function(req, res) {
    let username = req.body.username.toString();
    let password = req.body.password.toString();

    let authResult = {
      "time":        new Date().toLocaleString(),
      "username":    username,
      "ip":          req.ip,
      "authed":      false,
      "grantedUser": false,
      "error":       null
    };

    ad.authenticate(`${username}@${config.domain}`, password, function(err, auth) {
      if (auth) { // авторизован
        authResult.authed=auth;

        ad.isUserMemberOf(username, config.groupName, function(err, isMember) {
          if (err) {
            console.log("ERROR: " + JSON.stringify(err));
            return;
          };

          authResult.grantedUser=isMember;
          console.log("\nАвторизация в приложении:");
          console.log(authResult);

          if(isMember){
            // авторизован и есть доступ
            req.session.user = { "username": username, "granted": isMember};
            res.redirect("/");
          } else {
            // авторизован, но нет в группе для доступа
            req.session.user = null;
            res.status(403).render("authError", {
              username: username,
              code:     405,
              group:    config.groupName
            });
          };
        });
      } else {
        // ошибка авторизации
        console.log(authResult);
        req.session.user = null;
        res.status(403).render("authError", { "username": username, "code": 403})
      }
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////
  app.get("/logout", checkAuth, function(req, res){
    console.log("logout: %j", req.session.user);
    if (req.session.user) {
      req.session.destroy();
      res.redirect("/");
    }
  });
}
