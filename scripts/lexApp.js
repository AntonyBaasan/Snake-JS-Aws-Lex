var lexApp = (function () {
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        // Provide your Pool Id here
        IdentityPoolId: '' // BotPool
    });

    var lexruntime = new AWS.LexRuntime();
    var lexUserId = 'prophix-helper-demo-' + Date.now();
    var sessionAttributes = {
        "UserName": "Antony",
        "ModuleName": "Process Manager"
    };

    function startRecording(button) {
        recorder && recorder.record();
        button.disabled = true;
        button.nextElementSibling.disabled = false;
        __log('Recording...');
    }

    function stopRecording(button, callBack) {
        recorder && recorder.stop();
        button.disabled = true;
        button.previousElementSibling.disabled = false;
        __log('Stopped recording.');

        // create WAV download link using audio data blob
        sendAudioAsDownsample(callBack);

        recorder.clear();
    }

    function sendChat(callBack) {
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

    function showResponse(lexResponse, callBack) {
        console.log(lexResponse);
        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';

        if (lexResponse.message) {
            responsePara.appendChild(document.createTextNode(lexResponse.message));
            responsePara.appendChild(document.createElement('br'));
        }

        if (lexResponse.dialogState === 'ReadyForFulfillment') {
            responsePara.appendChild(document.createTextNode('Ready for fulfillment'));
            callBack(lexResponse);
        } else {
            responsePara.appendChild(document.createTextNode('(' + lexResponse.dialogState + ')'));
        }

        conversationDiv.appendChild(responsePara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    function sendAudioAsDownsample(callBack) {
        recorder && recorder.getBuffer(function (buffers) {

            var recBuffer = [];

            recBuffer.push(buffers[0]);

            var mergedBuffers = recBuffer;
            // Downsample
            var downsampledBuffer = downsampleBuffer(mergedBuffers[0], 16000, audio_context.sampleRate);
            // Encode as a WAV
            var encodedWav = encodeWAV(downsampledBuffer, 16000);
            // Create Blob
            var audioBlob = new Blob([encodedWav], { type: 'application/octet-stream' });

            convertBlobToUrl(audioBlob);

            sendPostContent(audioBlob, callBack);

            return false;
        });
    }

    function sendPostContent(audioBlob, callBack) {
        if (audioBlob) {
            // send it to the Lex runtime
            var params = {
                botAlias: '$LATEST',
                botName: 'Prophix_BotOne',
                inputStream: audioBlob,
                contentType: 'audio/x-l16; sample-rate=' + audio_context.sampleRate + '; channel-count=1', //wav file
                userId: lexUserId,
                sessionAttributes: sessionAttributes,
                accept: "audio/ogg"
            };

            lexruntime.postContent(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    // console.error('Error:  ' + err.message + ' (see console for details)')
                }
                if (data) {
                    playAudioResponse(data.audioStream);
                    // capture the sessionAttributes for the next cycle
                    sessionAttributes = data.sessionAttributes;

                    showResponse(data, callBack);
                }
            });
        }
    }

    var audio_context;
    var recorder;
    window.onload = function init() {
        try {
            // webkit shim
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            window.URL = window.URL || window.webkitURL;

            audio_context = new AudioContext;
            __log('Audio context set up.');
            __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
            alert('No web audio support in this browser!');
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            var input = audio_context.createMediaStreamSource(stream);
            __log('Media stream created.');

            recorder = new Recorder(input, { sampleRate: 16000 });
            __log('Recorder initialised.');
        }).catch(function () {
            __log('No live audio input: ' + e);
        });
    };

    return {
        sendChat: sendChat,
        startRecording: startRecording,
        stopRecording: stopRecording
    }

})();