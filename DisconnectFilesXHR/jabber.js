var appSetting = require('./settings.json');
var xmpp = require('node-xmpp');

var client = new xmpp.Client({ jid: appSetting.jabber.login,  password: appSetting.jabber.password });

process.on('message', function (sendNotify) {
    client.addListener('online', function(data) {
        var stanza = new xmpp.Element(
            'message',
            { to: appSetting.jabber.recipient, type: 'chat' }
        ).c('body').t(appSetting.jabber.notifyTxt);
        
        client.send(stanza);
        client.end();
    });

    client.addListener('error', function(err) {
        var result = {
            code: "error",
            description: "При отправке возникла ошибка: " + err.toString()};
        console.error(result);
        process.send(result);
    });
    
    client.addListener('end', function(e) {
        var result = {
            code: "sended",
            description: "Отправлено успешно."};
        process.send(result);
    })
});