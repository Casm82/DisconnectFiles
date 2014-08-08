window.addEventListener("load", pageLoaded, false);

function disconnectFiles(event)
{
    var elm = {fileGroup: this.id};
    var req = new XMLHttpRequest();
    req.open("POST", "/disconnect");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.send(JSON.stringify(elm));
    
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            var type = req.getResponseHeader("Content-Type");
            if (type == "application/json; charset=utf-8")
            {
                console.log(JSON.parse(req.responseText));
               
            } else {
                    console.log("not JSON");                        
            }
        }
    };
    
}

function pageLoaded() {
    document.getElementById("buttonDB1").addEventListener("click", disconnectFiles, false);
    document.getElementById("buttonDB2").addEventListener("click", disconnectFiles, false);
}