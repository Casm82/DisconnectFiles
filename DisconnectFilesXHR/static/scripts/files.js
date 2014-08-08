window.addEventListener("load", pageLoaded, false);

function sendNotify(event)
{   var elm = this.id;
    var confirmSendDiv = document.getElementById("confirmSend");
    confirmSendDiv.style.display="block";
    document.getElementById("filesManagment").style.visibility="hidden";
        
    if (this == buttonNotify ) {
        buttonNotify.style.backgroundColor="lime";
    }
    
    function confirmClicked(clickEvent){  
        var answer = this.value;
        
        if (answer=="yes") {
            confirmSendDiv.innerHTML="Выполняем отправку. Ждите.";
            
            function waitResponse() { confirmSendDiv.innerHTML += "." };
            var timerID = setInterval(waitResponse, 1000);
            
            var req = new XMLHttpRequest();
            req.open("POST", "/sendNotify");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.send(JSON.stringify({notify: elm}));
            
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    var type = req.getResponseHeader("Content-Type");
                    if (type == "application/json; charset=utf-8")
                    {
                        clearInterval(timerID);
                        var response = JSON.parse(req.response);
                        confirmSendDiv.innerHTML = response.description;
                        
                        if (response.code == "sended") {
                            window.location="/";
                        };
                        if (response.code == "error") { 
                            confirmSendDiv.style.color = "red";
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
    
    var confirmButtons = document.getElementsByName("confirmSend");
    for(var i=0; i < confirmButtons.length; i++) {
        confirmButtons[i].addEventListener("click", confirmClicked, false);
    } 
}

function disconnectFiles(event)
{
    var elm = this.id;
    var confirmDisconnectDiv = document.getElementById("confirmDisconnect");
    confirmDisconnectDiv.style.display="block";
    document.getElementById("notifyUpdate").style.visibility="hidden";
 
    // Выделяем нажатую кнопку и убираем выделение с других кнопок
    var manageButtonsArray = document.getElementsByClassName("manageButtons");
    for(var i=0; i < manageButtonsArray.length; i++) {
        var elmt = manageButtonsArray[i];
        if (this == elmt) {
            elmt.style.backgroundColor="red";
        } else {
            elmt.style.backgroundColor="inherit";
        }
    }
    
    function confirmClicked(clickEvent){  
        var answer = this.value;
        if (answer=="yes") {
            confirmDisconnectDiv.innerHTML = "Выполняем отключение. Ждите.";

            function waitResponse() { confirmDisconnectDiv.innerHTML += "." };
            var timerID = setInterval(waitResponse, 1000);
            
            var req = new XMLHttpRequest();
            req.open("POST", "/disconnect");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.send(JSON.stringify({fileGroup: elm}));
            
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    var type = req.getResponseHeader("Content-Type");
                    if (type == "text/html; charset=utf-8")
                    {
                        clearInterval(timerID);
                        document.getElementById("workArea").innerHTML = req.responseText;
                    } else {
                        console.log(JSON.parse(req.responseText));
                    }
                };
            };
        };
        if (answer=="no") { window.location="/"};
    }
    
    var confirmButtons = document.getElementsByName("confirmDisconnect");
    for(var i=0; i < confirmButtons.length; i++) {
        confirmButtons[i].addEventListener("click", confirmClicked, false);
    } 
}


function pageLoaded() {

    var buttonNotify = document.getElementById("buttonNotify");
    var buttonDB1 = document.getElementById("buttonDB1");
    var buttonDB2 = document.getElementById("buttonDB2");
    var buttonDB3 = document.getElementById("buttonDB3");
    var buttonDB4 = document.getElementById("buttonDB4");

    buttonNotify.addEventListener("click", sendNotify, false);
    buttonDB1.addEventListener("click", disconnectFiles, false);
    buttonDB2.addEventListener("click", disconnectFiles, false);
    buttonDB3.addEventListener("click", disconnectFiles, false);
    buttonDB4.addEventListener("click", disconnectFiles, false);
}