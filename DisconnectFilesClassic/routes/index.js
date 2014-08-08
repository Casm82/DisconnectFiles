var appSetting = require('../settings.json');
var errors = require('./errors');
var checkLogin = require('../checkLogin');

module.exports = function (app) {

    app.get('/', function(req, res){
        if (req.session.user) { res.redirect('/managefiles') };
        res.render('index', 
            {
                title: "Отключение файлов",
                session: req.session
            });
    });

    app.post('/session', function(req, res) {
        var user = {
                username: req.body.username.toString(), 
                password: req.body.password.toString(),
                granted: null
            };
            
        var authProc = require('child_process').fork(__dirname + './../auth.js');
        
        authProc.send(user);
        
        authProc.on('message', function(authResult) {
			authResult.ip = req.ip;
			/* authResult: {
				"time":"Tue Aug 05 2014 09:37:48 GMT+0400 (Арабское время (зима))",
				"error":null,"username":"123456","authed":true,"cennamMember":true,
				"ip":"172.16.1.2"}
			*/
			console.log("authResult: %j\n", authResult);
            if (authResult.authed) {
                if(authResult.cennamMember){
                // авторизован и есть доступ
                    user.granted = true;
                    req.session.user = {username: user.username, granted: user.granted};
                    res.redirect('/managefiles');
                } else {
                // авторизован, но отказано в доступе
                    req.session.user = null;
                    console.log("notPermited: %j\nip: %s\n", req.session, req.ip);
                    res.render("authError", 
                        {
                            username: user.username,
                            code: "notPermited",
                            session: req.session
                        });
                }
            } else {
                // ошибка авторизации
                req.session.user = null;
                console.log("notPermited: %j\nip: %s\n",req.session, req.ip);
                res.render("authError",
                    {
                        username: user.username,
                        code: "notAuthed",
                        session: req.session
                    });
            }
            authProc.kill();
            });
    });

    app.get('/managefiles', checkLogin.authD, function(req, res){
        res.render('managefiles', 
            {
                title: "Отключение файлов",
                session: req.session
            });
    });

    app.get('/logout', function(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    });


    app.post('/disconnect', checkLogin.authD, function(req, res) {
        var disconnectExec = require('child_process').fork(__dirname + './../disconnect.js');
        switch(req.body.fileGroup) {
            case "buttonCennam":
                { filesArray = appSetting.filesCennamArray; break; };
            case "buttonKonstsp": 
                { filesArray = appSetting.filesKonstspArray; break; };
            }
        disconnectExec.send(filesArray);
        
        disconnectExec.on('message', function(disconnectResult) {
            var eventTime = new Date();
            console.log("%j\n",eventTime);
            console.log("disconnectResult: %j", disconnectResult);
            res.render("disconnected",
                {
                    title: "Файлы отключены",
                    filesArray: filesArray,
                    output: disconnectResult,
                    session: req.session
                });
            disconnectExec.kill();
        });
    });

    // error handlers
    errors(app);
}
