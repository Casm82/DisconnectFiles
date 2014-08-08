var appSetting = require('../settings.json');
var errors = require('./errors');
var checkLogin = require('../checkLogin');
var jade = require('jade');

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
				"error":null,"username":"123456","authed":true,"DB1Member":true,
				"ip":"172.16.1.2"}
			*/
			console.log("authResult: %j\n", authResult);
            if (authResult.authed) {
                if(authResult.DB1Member){
                // авторизован и есть доступ
                    user.granted = true;
                    req.session.user = {username: user.username, granted: user.granted};
                    //  "user":{"username":"123456","granted":true}}
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
                session: req.session,
                filesArray: JSON.stringify(appSetting.filesDB1Array)
            });
    });

    app.get('/logout', function(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    });


    app.post('/disconnect', checkLogin.authD, function(req, res) {
        var disconnectExec = require('child_process').fork(__dirname + './../disconnect.js');
        
        switch(req.body.fileGroup) {
            case "buttonDB1":
                { var filesArray = appSetting.filesDB1Array; break; };
            case "buttonDB2": 
                { var filesArray = appSetting.filesDB2Array; break; };
            case "buttonDB3": 
                { var filesArray = appSetting.filesDB3Array; break; };
            case "buttonDB4": 
                { var filesArray = appSetting.filesDB4Array; break; };
            }
        disconnectExec.send(filesArray);
        
        disconnectExec.on('message', function(disconnectResult) {
            var eventTime = new Date();
            console.log("\n%j",eventTime);
            console.log("disconnectResult: %j", disconnectResult);
            var jadeOptions =
                {
                    filesArray: filesArray,
                    output: disconnectResult,
                    session: req.session
                };
            var html = jade.renderFile('./views/jadeElements/disconnectReport.jade', jadeOptions);
            res.send(200, html);
            disconnectExec.kill();
        });
    });

    app.post('/sendNotify', checkLogin.authD, function(req, res) {
        console.log("xmpp recieve: %j", req.body);
        
        var jabber = require('child_process').fork(__dirname + './../jabber.js');
        jabber.send(req.body);  // {"notify":"buttonNotify"}
        
        jabber.on('message', function(sendResult) {
            var eventTime = new Date();
            console.log("\n%j",eventTime.toLocaleString());
            console.log("sendResult: %j", sendResult);
            res.json(200, sendResult);
            jabber.kill();
        });
    });

    
    // error handlers
    errors(app);
}
