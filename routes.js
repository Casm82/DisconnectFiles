"use strict";
var fs = require("fs");

module.exports = function (app, io) {
  var config = require("./settings.json");
  var EventEmitter = require("events").EventEmitter;
  var disconnectEm = new EventEmitter();

  ///////////////////////////////////////////////////////////////

  // События
  disconnectEm.on("fileClosed", function(msg){
    if (msg.socketID && io.sockets.sockets && io.sockets.sockets[msg.socketID]) {
      console.log("fileClosed: %j", msg);
      io.sockets.sockets[msg.socketID].emit("fileClosed", msg);
    };
  });

  disconnectEm.on("fileError", function(msg){
    if (msg.socketID && io.sockets.sockets && io.sockets.sockets[msg.socketID]) {
      console.log("\nfileError: %j", msg);
      io.sockets.sockets[msg.socketID].emit("fileError", msg);
    };
  });

  disconnectEm.on("grpClosed", function(msg){
    if (msg.socketID && io.sockets.sockets && io.sockets.sockets[msg.socketID]) {
      console.log("grpClosed: %j", msg);
      io.sockets.sockets[msg.socketID].emit("grpClosed", msg);
    };
  });

  ///////////////////////////////////////////////////////////////

  // Главная страница
  app.get("/", function(req, res){
    if (req.session.user) {

      let filesJade = config.filesArr.map( (files) => {
        let tmpArray = [];
        for (let file of files) {
          tmpArray.push(file.replace(/\w:\\MDB/i,"S:"));
        };
        return tmpArray;
      });
      // console.log(filesJade);

      res.render("managefiles", {
        title:       "Отключение файлов",
        session:     req.session,
        fileServer:  config.fileServer,
        notifyTxt:   config.notifyTxt,
        filesJade:   filesJade
      });
    } else {
      res.render("login", {
        title:   "Отключение файлов"
      });
    }
  });

  ///////////////////////////////////////////////////////////////
  require("./1_sessions")(app);
  require("./2_disconnect")(app, disconnectEm);
  require("./3_sendNotify")(app);
  require("./9_errors");(app);       // Обработчик ошибок
  ///////////////////////////////////////////////////////////////
}
