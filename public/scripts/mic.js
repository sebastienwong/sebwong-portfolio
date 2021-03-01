var freqBinDataArray; 
var inited = false;
var vib = false;

function init() {
    document.getElementById("overlay").style.display = "none";
    inited = true;
    var audioContext = new(window.AudioContext || window.webkitAudioContext)();
    var microphone;

    var analyser = audioContext.createAnalyser();

    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
        var constraints = { audio: true }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                //analyser.connect(audioContext.destination);
                beginRecording();
                audioStart();
            })
            .catch(function(err) {
                console.error('error: ' + err);
            })
    } else {
        console.error('getUserMedia unsupported by browser');
    }

    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if(navigator.vibrate) {
        vib = true;
    }

    function setVibrate(s) {
        if(vib) {
            navigator.vibrate(s);
        }
    }

    function beginRecording() {
        analyser.fftSize = 1024; // power of 2, between 32 and max unsigned integer
        var bufferLength = analyser.fftSize;

        freqBinDataArray = new Uint8Array(bufferLength);

        var checkAudio = function() {
            analyser.getByteFrequencyData(freqBinDataArray);

            //console.log('Volume: ' + getRMS(freqBinDataArray));
            //console.log('Freq Bin: ' + getIndexOfMax(freqBinDataArray));
            //console.log(freqBinDataArray);
        }

        setInterval(checkAudio, 16);
    }
}

function getVolume() {
    return getRMS(freqBinDataArray);
}

function getFreq() {
    return getIndexOfMax(freqBinDataArray);
}

function getRMS(spectrum) {
    var rms = 0;
    for (var i = 0; i < spectrum.length; i++) {
        rms += spectrum[i] * spectrum[i];
    }
    rms /= spectrum.length;
    rms = Math.sqrt(rms);
    return rms;
}

function getIndexOfMax(array) {
    return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}