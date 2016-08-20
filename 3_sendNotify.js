"use strict";
module.exports = function(app){
  let checkAuth = require("./checkAuth");
  let config = require('./settings.json');
  let Client = require('node-xmpp-client');
  ///////////////////////////////////////////////////////////////
  // Команда отправки оповещения
  app.post("/sendNotify", checkAuth, function(req, res) {
    if (req.body && req.body.notify && req.body.notify.match(/^notify-\d$/)) {
      let notifyId = Number(req.body.notify.replace(/notify-/,""));

      console.log("\nВ %s отправлено оповещение %j пользователем %s",
        new Date().toLocaleString(), req.body.notify, req.session.user.username);

      var sendResult = {
        "error": null,
        "desc":  "Отправлено успешно."
      };

      let client = new Client({
        jid:      config.jabber.login,
        password: config.jabber.password
      });

      client.addListener("error", (err) => {
        sendResult.desc  = `При отправке возникла ошибка: ${err.toString()}`;
        sendResult.error = err.toString();
      });

      client.addListener("end", () => {
        res.status(200).json(sendResult);
      });

      client.addListener("online", () => {
        let to     = config.jabber.recipient;
        let msgTxt = config.notifyTxt[notifyId];
        let stanza = new Client.Stanza('message', { to: to, type: 'chat' }).c('body').t(msgTxt);
        client.send(stanza);
        client.end();
      });
    } else {
      req.status(500).send("Не указан текст сообщения");
    };
  });
};
