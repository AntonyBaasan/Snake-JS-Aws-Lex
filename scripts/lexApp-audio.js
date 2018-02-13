var lexApp = (function () {
    // Initialize the Amazon Cognito credentials provider

    var lexruntime;
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

    function setConfig(code) {
        AWS.config.region = 'us-east-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            // Provide your Pool Id here
            IdentityPoolId: code // BotPool
        });
        
        lexruntime = new AWS.LexRuntime();
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
        if(lexruntime == undefined) {
            console.log("Please insert lex identity pool!")
            return;
        }

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
        startRecording: startRecording,
        stopRecording: stopRecording,
        setConfig: setConfig
    }

})();