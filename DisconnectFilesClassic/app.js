var express = require('express'),
    expressMiddlewares = require('express-middlewares'),
    exec = require('child_process').exec;

var checkLogin = require('./checkLogin');
var app = express();

// параметры
app.set('view engine', 'jade');
app.set('x-powered-by', false);

// middleware
app.use(expressMiddlewares.favicon());
app.use(express.static(__dirname + '/static'));
app.use(expressMiddlewares.bodyParser());

var cookieSecret = checkLogin.genkey();
app.use(expressMiddlewares.cookieParser(cookieSecret));
app.use(expressMiddlewares.session(
    {
      secret: cookieSecret,
      cookie: { maxAge: 3600000 }
    }));

var routes = require('./routes');
routes(app);

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});