var lexApp = (function () {
    // Initialize the Amazon Cognito credentials provider

    var lexruntime;
    var lexUserId = 'prophix-helper-demo-' + Date.now();
    var sessionAttributes = {
        "UserName": "Antony",
        "ModuleName": "Process Manager"
    };

    function sendChat(callBack) {
        if(lexruntime == undefined) {
            console.log("Please insert lex identity pool!")
            return;
        }

        // if there is text to be sent...
        var wisdomText = document.getElementById('wisdom');
        if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

            // disable input to show we're sending it
            var wisdom = wisdomText.value.trim();
            wisdomText.value = '...';
            wisdomText.locked = true;

            // send it to the Lex runtime
            var params = {
                botAlias: '$LATEST',
                botName: 'Prophix_BotOne',
                inputText: wisdom,
                userId: lexUserId,
                sessionAttributes: sessionAttributes,
            };

            showRequest(wisdom);

            lexruntime.postText(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    showError('Error:  ' + err.message + ' (see console for details)')
                }
                if (data) {
                    // capture the sessionAttributes for the next cycle
                    sessionAttributes = data.sessionAttributes;
                    // show response and/or error/dialog status
                    showResponse(data, callBack);
                }
                // re-enable input
                wisdomText.value = '';
                wisdomText.locked = false;
            });
        }
    }

    function setConfig(code) {
        AWS.config.region = 'us-east-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            // Provide your Pool Id here
            IdentityPoolId: code // BotPool
        });
        
        lexruntime = new AWS.LexRuntime();
    }

    return {
        sendChat: sendChat,
        setConfig: setConfig
    }

})();