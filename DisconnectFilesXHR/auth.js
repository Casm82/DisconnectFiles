var appSetting = require('./settings.json');
process.on('message', function (user) {
    var username = user.username,
        password = user.password;
        
    var ActiveDirectory = require('activedirectory');

    var ad = new ActiveDirectory(appSetting.ldapConfig);

    ad.authenticate(username + "@domain.ru", password, function(err, auth) {
		var loginTime = new Date();
        var authResult = {
				"time": loginTime.toLocaleString(), 
				"error": err, "username": username,
				"authed": auth, "cennamMember": null};
        
        if (err) {
            //console.log('ERROR: '+JSON.stringify(err));
            process.send(authResult);
            return;
        }

        if (auth) {
            //console.log('Authenticated!');
                        
            ad.isUserMemberOf(username, appSetting.groupName, function(err, isMember) {
                authResult.cennamMember=isMember;
                if (err) {
                    console.log('ERROR: ' +JSON.stringify(err));
                    return;
                }

                //console.log(username + ' isMemberOf ' + appSetting.groupName + ': ' + isMember);
                process.send(authResult);
            });
        }
        else {
            console.log('Authentication failed!');
            process.send(authResult);
        }
    });
})