"use strict";
window.addEventListener("load", function () {
  // Устанавливаем сессию Socket.io
  var socket = io.connect(window.location.origin);

  socket.on("grpClosed", function (obj) {
    var result = document.getElementById("finalResult");
    result.innerHTML = obj.txt;
  });

  socket.on("fileClosed", function (obj) {
    var fileStatus = document.getElementById(obj.fileIndex);
    fileStatus.className = "statusOK";
    fileStatus.innerHTML = "отключено " + obj.number;
  });

  socket.on("fileError", function (obj) {
    var fileStatus = document.getElementById(obj.fileIndex);
    fileStatus.className = "statusError";
    fileStatus.innerHTML = "ошибка";
  });

  socket.on("connect", function (){
    var socketID = socket.nsp + "#" + socket.id;
    // console.log(socketID);

    // Добавляем обработчик для кнопок отключения файлов
    var manageButtonsArray = document.getElementsByClassName("manageButtons");
    for(var i=0; i < manageButtonsArray.length; i++) {
      var elmt = manageButtonsArray[i];
      elmt.addEventListener("click", disconnectFiles, false);
    };

    function disconnectFiles(){
      var elm = this.id;
      // Показываем диалог подтверждения, прячем блок отправки сообщений
      var confirmDisconnectDiv = document.getElementById("confirmDisconnect");
      confirmDisconnectDiv.style.display="block";
      document.getElementById("notifyUpdate").style.opacity = "0.25";

      // Выделяем нажатую кнопку и убираем выделение с других кнопок
      var manageButtonsArray = document.getElementsByClassName("manageButtons");
      for(var i=0; i < manageButtonsArray.length; i++) {
        var elmt = manageButtonsArray[i];
        if (this == elmt) {
          elmt.style.backgroundColor="red";
        } else {
          elmt.style.backgroundColor="inherit";
          elmt.style.opacity = "0.25";
        }
        // удаляем обработчики нажатия на кнопки
        elmt.removeEventListener("click", disconnectFiles, false);
      }

      var confirmButtons = document.getElementsByClassName("confirmDisconnect");
      for(var i=0; i < confirmButtons.length; i++) {
        confirmButtons[i].addEventListener("click", confirmClicked, false);
      }

      function confirmClicked(){
        var answer = this.value;
        if (answer=="yes") {
          var req = new XMLHttpRequest();
          req.open("POST", "/disconnect");
          req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          req.send(JSON.stringify({"fileGroup": elm, "socketID": socketID}));

          req.onreadystatechange = function() {
            if (req.readyState === 4) {
              var workArea = document.getElementById("workArea");
              if (req.status === 200) {
                var type = req.getResponseHeader("Content-Type");
                if (type == "text/html; charset=utf-8") {
                  workArea.innerHTML = req.responseText;
                } else {
                  console.log(JSON.parse(req.responseText));
                }
              } else {
                workArea.innerHTML = "Возникла ошибка в работе";
              }
            }
          }
        }
        if (answer=="no") {
          setTimeout( function () { window.location="/"} , 500);
        };
      }
    }
  });

  // Добавляем обработчик для кнопок отправки оповещений
    var notifyButtonsArray = document.getElementsByClassName("notifyButtons");
    for(var i=0; i < notifyButtonsArray.length; i++) {
      var elmt = notifyButtonsArray[i];
      elmt.addEventListener("click", sendNotify, false);
    }

  function sendNotify(){
    var elm = this.id;
    var confirmSendDiv = document.getElementById("confirmSend");
    confirmSendDiv.style.display="block";
    document.getElementById("filesManagement").style.visibility="hidden";

    // Выделяем нажатую кнопку и убираем выделение с других кнопок
    var notifyButtonsArray = document.getElementsByClassName("notifyButtons");
    for(var i=0; i < notifyButtonsArray.length; i++) {
      var elmt = notifyButtonsArray[i];
      if (this == elmt) {
        elmt.style.backgroundColor="lime";
      } else {
        elmt.style.backgroundColor="inherit";
      }
      // удаляем обработчики нажатия на кнопки
      elmt.removeEventListener("click", sendNotify, false);
    };

    var confirmButtons = document.getElementsByClassName("confirmSend");
    for(var i=0; i < confirmButtons.length; i++) {
      confirmButtons[i].addEventListener("click", confirmClicked, false);
    };

    function confirmClicked(){
      var answer = this.value;

      if (answer=="yes") {
        confirmSendDiv.innerHTML="Выполняем отправку. Ждите...";

        var req = new XMLHttpRequest();
        req.open("POST", "/sendNotify");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.send(JSON.stringify({notify: elm}));

        req.onreadystatechange = function() {
          if (req.readyState === 4 && req.status === 200) {
            var type = req.getResponseHeader("Content-Type");
            if (type == "application/json; charset=utf-8") {
              var response = JSON.parse(req.response);
              confirmSendDiv.innerHTML = response.desc;
              if (response.error) {
                confirmSendDiv.style.color = "red";
              } else {
                window.location="/";
              };
            } else {
              console.log(req.responseText);
              confirmSendDiv.innerHTML = "Возникла ошибка в работе сервера.";
            }
          };
        };
      };
      if (answer=="no") { window.location="/"};
    }
  }

} , false);
