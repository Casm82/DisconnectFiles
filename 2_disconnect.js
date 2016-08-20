"use strict";
module.exports = function(app, disconnectEm){
  let checkAuth = require("./checkAuth");
  let config    = require("./settings.json");
  let server    = config.fileServer;
  let async     = require("async");
  let exec      = require("child_process").exec;

  // Команда на отключение файлов из XHR
  app.post("/disconnect", checkAuth, function(req, res) {
    let socketID = req.body.socketID;
    let filesArray;
    let grpId;

    if (req.body.fileGroup && req.body.fileGroup.match(/files-\d/)) {
      grpId = Number(req.body.fileGroup.replace(/files-/,""));
      filesArray = config.filesArr[grpId];
    };

    if (socketID && filesArray) {
      let logEntry = {
        "username":   req.session.user.username,
        "date":       new Date().toLocaleString(),
        "files":      filesArray,
        "userAgent":  req.headers['user-agent'],
        "ip":         req.ip
      };
      console.log("\nЗапущено отключение файлов");
      console.log(logEntry);

      let jadeFiles = filesArray.map( (elm) => { return elm.replace(/\w:\\MDB/i,"S:") });

      if (app.locals.jobs && app.locals.jobs[grpId]){
        res.render("elmDublicate", {
          "job":   app.locals.jobs[grpId],
          "files": jadeFiles
        });
      } else {
        // Записываем в глобальную переменную выполняему задачу
        if (!app.locals.jobs) { app.locals.jobs = {} };

        app.locals.jobs[grpId] = {
          "user" : req.session.user.username,
          "ts"   : new Date()
        };

        res.render("elmReport", { "files": jadeFiles });

        async.each(filesArray, disconnectFile, function(err){
          //Удаляем задание из очереди
          delete app.locals.jobs[grpId];

          if (err) {
            console.log("Произошла ошибка отключения группы файлов");
            disconnectEm.emit("grpClosed", {
              "txt":      "Произошла ошибка отключения группы файлов.",
              "socketID": socketID
            });
          } else {
            // console.log("Группа файлов отключена успешно");
            disconnectEm.emit("grpClosed", {
              "txt":      "Группа файлов отключена успешно.",
              "socketID": socketID
            });
          }
        });

        function disconnectFile(file, cbEach) {
          //OPENFILES /Disconnect /S TESTDC /OP "c:\share\KS\db1.mdb" /ID "*" | iconv -f CP866 -t UTF-8
          let disconnectCmd = `OPENFILES /Disconnect /S ${server} /OP "${file}" /ID "*" | iconv -f CP866 -t UTF-8`;

          exec(disconnectCmd, function (error, stdout, stderr) {
            let fileIndex = filesArray.indexOf(file);
            if (error) {
              console.log(error);
              disconnectEm.emit("fileError", {
                "fileIndex": fileIndex,
                "fileName":  file,
                "err":       error.toString(),
                "socketID":  socketID
              });
              cbEach(error);
            } else {
              let numClosed = 0;
              if (stdout) {
              //были подключения
                let outputArray = stdout.toString().replace(/\"/g, "").split(/\r\n/).filter( (elm) => { return elm;});
                numClosed = outputArray.length;
              };
              disconnectEm.emit("fileClosed", {
                "fileIndex": fileIndex,
                "fileName":  file,
                "number":    numClosed,
                "socketID":  socketID
              });
              cbEach();
            }
          });
        };
      }

    } else {
      res.status(500).send("Не получены параметры запроса.");
    }
  });
}
