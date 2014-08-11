var appSetting = require('./settings.json');
var disconnectResult = [];
/*
disconnectResult: [
{"resultTxt":"Успех: Подключение к открытому файлу c:\\share\\db1\\file1.mdb успешно завершено.","resultNums":3},
...
{"resultTxt":"Успех: Подключение к открытому файлу c:\\share\\db1\\file1.ldb успешно завершено.","resultNums":3}]
*/
var server = appSetting.fileServer;
var exec = require('child_process').exec;

process.on('message', function (filesArray) {
    function disconnectFile(file) {
    //OPENFILES /Disconnect /S FILESERVER /OP "c:\share\db1\file1.mdb" /ID "*" | iconv -f CP866 -t UTF-8

        var disconnectCmd = 'OPENFILES /Disconnect /S ' + server + ' /OP ' + 
            '"' + file + '"' + ' /ID "*" | iconv -f CP866 -t UTF-8';
        
        var cmd = exec(disconnectCmd, function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                process.send(error);
            }
            if (stdout) {
                var outputArray =
                    stdout.toString()
                    .replace(/\"/g, "")
                    .split(/\r\n/)
                    .filter(function (elm) { return elm;});
		    
                var result = 
                    {
                        resultTxt: outputArray[0],
                        resultNums: outputArray.length
                    };
                
            } else {
                var result = null;
            };
                        
            disconnectResult.push(result);
            
            if (filesArray.length) {
                disconnectFile(filesArray.pop())
            } else {
                process.send(disconnectResult.reverse());
            };
        });
    }
    disconnectFile(filesArray.pop());
})