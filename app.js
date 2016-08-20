"use strict";

var express      = require("express");
var middlewares  = require("express-middlewares");
var session      = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
var socketio     = require("socket.io");
var exec         = require("child_process").exec;
var crypto       = require("crypto");
var path         = require("path");
var https        = require("https");
var routes       = require("./routes");
var config       = require("./settings.json");

var sslcert = {
  key:  fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

// Web-сервер
var app = express();

var httpsServer = https.createServer(sslcert, app);
var io = socketio.listen(httpServer);

// параметры
app.set("view engine", "pug");
app.set("x-powered-by", false);

// middleware
app.use(middlewares.favicon());
app.use(express.static(path.join(__dirname, "static")));
app.use(middlewares.bodyParser());

var cookieSecret = '5c7X1hBf/kGAJchzZV255qxRQMXQ76TByutPP7EQ9u0=';

app.use(middlewares.cookieParser(cookieSecret));

app.use(session({
  "secret":            cookieSecret,
  "name":              "accessDB.sid",
  "resave":            false,
  "saveUninitialized": false,
  "cookie":            { maxAge: 30*24*60*60*1000, secure: false },
  "store":             new MongoDBStore(config.mongoConfig)
}));

httpsServer.listen(config.httpPort, function(){
  routes(app, io);
  console.log(`Web сервер запущен и слушает по адресу http://${process.env.COMPUTERNAME}:${config.httpPort}`);
});
