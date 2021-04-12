// Adapted from https://github.com/shanet/WebRTC-Example

var localVid = document.getElementById("localVideo");
var remoteVid = $("#remoteVideo");
var btn1 = $("#btn-client1");
var btn2 = $("#btn-client2");
var theInput = $("#msgInput");
var callBtn = $("#btn-call");
var msgDiv = $("#msgDiv");


var hiBtn = $("#btn-hi");
var pkbBtn = $("#btn-pkb");
var pirBtn = $("#btn-pir");
var rhysBtn = $("#btn-rhys");

var client = 0;

var peekaboo_clicked = false;
var peekaboo_ready = false;

var pirate_clicked = false;
var toggle_pirate = false;

var interacting = false;

var localStream;
var peerConnection;
var serverConnection;

var drumroll = new Howl({
    src: ['../assets/drumroll.mp3'],
    loop: true,
    volume: 0.25
});

var tada = new Howl({
    src: ['../assets/tada.mp3'],
    volume: 0.25
});

var pirate_music = new Howl({
    src: ['../assets/pirate_music.mp3'],
    volume: 0.05,
    loop: true
});

var bell = new Howl({
    src: ['../assets/bell.mp3'],
    volume: 0.25
});
var uke = new Howl({
    src: ['../assets/uke.mp3'],
    volume: 0.25
});
var squeak = new Howl({
    src: ['../assets/squeak.mp3'],
    volume: 0.25
});
var rattle = new Howl({
    src: ['../assets/rattle.mp3'],
    volume: 0.25
});

var rhys_sounds = [bell, uke, squeak, rattle];


var myConfetti = confetti.create(document.getElementById('confetti'), {
    resize: true
});


const peerConnectionConfig = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun.ekiga.net" },
        { urls: "stun:stun.fwdnet.net" },
        { urls: "stun:stun.ideasip.com" },
        { urls: "stun:stun.iptel.org" },
    ],
};

const MessageType = {
    SERVER_INFO: 0,
    CLIENT1: 1,
    CLIENT2: 2,
    CALL_REQUEST: 3,
    INTERACTION: 4,
    INTERACTION_COMPLETE: 5,
    PEEK: 6,
    BOO: 7,
    PIRATE: 8,
    RHYS: 9
};

btn1.on("click", () => {
    getWebcam();
    btn2.prop("disabled", true);
    destination = "wss://" + location.host + "/client1";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;

    client = 1;
    mainScreen();
    $('#status').html("Welcome Oma & Opa!");
});

btn2.on("click", () => {
    getWebcam();
    btn1.prop("disabled", true);
    destination = "wss://" + location.host + "/client2";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;

    client = 2;
    mainScreen();
    $('#status').html("Welcome Rhys & Lora!");
});

hiBtn.on("click", () => {
    console.log('hi btn pressed')
})

pkbBtn.on("click", () => {
    console.log("pkb btn pressed");
    peekaboo_clicked = true;
    pkbBtn.prop('disabled', true);
    pkbBtn.removeClass('join-button-hover');
})

pirBtn.on("click", () => {
    console.log("pir btn pressed");
    pirate_clicked = !pirate_clicked;
    togglePirate();
    console.log(pirate_clicked);
    if(pirate_clicked) {
        pirate_music.play();
        $('#pir-msg').html("Pirate mode on!");
    } else {
        pirate_music.stop();
        $('#pir-msg').html("");
    }
})

rhysBtn.on("click", () => {
    console.log("rhys btn pressed");
    sendRhys();
})

function sendPeek() {
    if(peerConnection) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.PEEK,
                message: "Peek"
            })
        )
        peekaboo_clicked = false;
        drumroll.play();
    }
}

function sendBoo() {
    if(peerConnection) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.BOO,
                message: "Boo"
            })
        )
        peekaboo_ready = false;
        drumroll.stop();
        tada.play();
    }
}

function togglePirate() {
    if(peerConnection) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.PIRATE,
                message: pirate_clicked
            })
        )
    }
}

function sendRhys() {
    var r = Math.floor(Math.random() * 4);
    console.log(r);
    if(peerConnection) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.RHYS,
                message: r
            })
        );

        rhys_sounds[r].play();
    }
}

callBtn.on("click", () => {
    start(true);
});

function getWebcam() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                video: true,
                audio: true,
            },
            (stream) => {
                // success
                localStream = stream;
                localVid.srcObject = stream;
                if(client == 1) {
                    localVid.onloadeddata = function() {
                        //predictWebcam;
                        detectFaces();
                    }
                }
                $("#localVideo").css("display", "block");
            },
            (error) => {
                // error
                console.error(error);
            }
        );
    } else {
        alert("Your browser does not support getUserMedia API");
    }
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
    peerConnection.addStream(localStream);

    $('#local-wrapper').removeClass('large-local');
    $('#local-wrapper').addClass('mini-local');

    if (isCaller) {
        peerConnection.createOffer().then(createdDescription).catch(errorHandler); // using chained Promises for async
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.CALL_REQUEST,
                ice: event.candidate,
                message: "Sending ICE candidate",
            })
        );
    }
}

function createdDescription(description) {
    console.log("got description");

    peerConnection
        .setLocalDescription(description)
        .then(() => {
            serverConnection.send(
                JSON.stringify({
                    type: MessageType.CALL_REQUEST,
                    sdp: peerConnection.localDescription,
                    message: "Requesting call",
                })
            );
        })
        .catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log("got remote stream");
    $('#status-wrapper').css("display", "none");
    if(client == 1) { $('#control-panel').css("display", "flex"); }
    remoteVid.prop("srcObject", event.streams[0]);
    $('#remote-wrapper').css("display", "block");
    msgDiv.html("Connected to peer.");
}

function handleMessage(mEvent) {
    var msg = JSON.parse(mEvent.data);

    switch (msg.type) {
        case MessageType.SERVER_INFO:
            msgDiv.html(msg.message);
            break;

            // Message came from Client 1, Handle as Client2
        case MessageType.CLIENT1:
            if(client == 2) {
                msgDiv.html(msg.message);
            }
            break;

            // Message came from Client 2, Handle as Client1
        case MessageType.CLIENT2:
            if(client == 1) {
                msgDiv.html(msg.message);
            }
            break;

        case MessageType.CALL_REQUEST:
            if (!peerConnection) {
                msgDiv.html("Receiving Call!");
                start(false);
            }

            // Are we on the SDP stage or the ICE stage of the handshake?
            if (msg.sdp) {
                peerConnection
                    .setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => {
                        // Only create answers in response to offers
                        if (msg.sdp.type == "offer") {
                            peerConnection
                                .createAnswer()
                                .then(createdDescription)
                                .catch(errorHandler);
                        }
                    })
                    .catch(errorHandler);
            } else if (msg.ice) {
                peerConnection
                    .addIceCandidate(new RTCIceCandidate(msg.ice))
                    .catch(errorHandler);
            }
            break;
        case MessageType.INTERACTION:
            if(client == 2 && !interacting) {
                interacting = true;
                $('#interaction').css("display", "block");
                $('#interaction').html(msg.message);
                console.log(msg.message + " received");
                setTimeout(function () {
                    $('#interaction').css("display", "none");
                    interacting = false;
                    serverConnection.send(
                        JSON.stringify({
                            type: MessageType.INTERACTION_COMPLETE,
                            message: "peekaboo"
                        })
                    )
                }, 5000);
            }
            break;
        case MessageType.INTERACTION_COMPLETE:
            if(client == 1) {
                console.log(msg.message + " complete");
                pkbBtn.addClass('join-button-hover');
                pkbBtn.prop('disabled', false);
            }
            break;
        case MessageType.PEEK:
            if(client == 2) {
                console.log(msg.message + " received");
                pkbBtn.addClass('join-button-hover');
                pkbBtn.prop('disabled', false);
                drumroll.play();
                $('#spotlight').css({
                    'visibility': 'visible',
                    'opacity': '1'
                });
            }
            break;
        case MessageType.BOO:
            if(client == 2) {
                console.log(msg.message + " received");
                pkbBtn.addClass('join-button-hover');
                pkbBtn.prop('disabled', false);
                serverConnection.send(
                    JSON.stringify({
                        type: MessageType.INTERACTION_COMPLETE,
                        message: "peekaboo"
                    })
                );
                drumroll.stop();
                tada.play();
                $('#spotlight').css({
                    'visibility': 'hidden',
                    'opacity': '0'
                });
            }

            break;
        case MessageType.PIRATE:
            if(client == 2) {
                console.log("pirate toggle received");
                toggle_pirate = msg.message;

                if(toggle_pirate) {
                    drawHat();
                    pirate_music.play();
                    $('#big-boat').css({
                        "display": "block"
                    });
                } else {
                    pirate_music.stop();
                    $('#big-boat').css({
                        "display": "none"
                    });
                }
            }
            break;
        case MessageType.RHYS:
            if(client == 2) {
                console.log("rhys sound received");
                rhys_sounds[msg.message].play();

                shootConfetti(0);
            }
            break;
        default:
            break;
    }
}

function errorHandler(error) {
    console.error(error);
}


function mainScreen() {
    $('#join-wrapper').css("display", "none");
    $('#main-wrapper').css("display", "flex");
    $('#remote-wrapper').css("display", "none");
}


function shootConfetti(shots) {
    let rx1 = Math.random() * (0.3 - 0.1) + 0.1;
    let rx2 = Math.random() * (0.9 - 0.7) + 0.7;

    myConfetti({
        particleCount: 300,
        spread: 360,
        startVelocity: 30,
        ticks: 500,
        scalar: 2,
        origin: {
            x: rx1,
            y: Math.random() - 0.2
        }
    })

    myConfetti({
        particleCount: 300,
        spread: 360,
        startVelocity: 30,
        ticks: 500,
        scalar: 2,
        origin: {
            x: rx2,
            y: Math.random() - 0.2
        }
    })

    setTimeout(function() {
        if(shots < 1) {
            shootConfetti(shots + 1);
        }
    }, 1000);  
}


// ***************************************************************


var model = undefined;

cocoSsd.load().then((loadedModel) => {
    msgDiv.html("Image Recognition Model loaded.");
    model = loadedModel;
});

function predictWebcam() {
    model.detect(localVid).then((predictions) => {
        // for(let i = 0; i < children.length; i++) {
        //     liveLocalView.removeChild(children[i]);
        // }
        // children.splice(0);

        // for(let i = 0; i < predictions.length; i++) {
        //     const p = document.createElement("p");
        //     p.innerText = predictions[i].class + 
        //         " - with " +
        //         Math.round(predictions[i].score * 100) +
        //         "% confidence";

        //     if(predictions[i].score > 0.66) {
        //         const highlighter = document.createElement("div");
        //         highlighter.setAttribute("class", "highlighter");
        //         highlighter.style = 
        //             "left: " + predictions[i].bbox[0] + "px; "
        //             "top: " + predictions[i].bbox[1] + "px; "
        //             "width: " + predictions[i].bbox[2] + "px; "
        //             "height: " + predictions[i].bbox[3] + "px;";

        //         liveLocalView.appendChild(highlighter);
        //         liveLocalView.appendChild(p);
        //         children.push(highlighter);
        //         children.push(p);
        //     }
        // }

        //if(predictions[0]) console.log(predictions[0].score);

        if(predictions[0] && predictions[0].class == "person" && predictions[0].score > 0.70) {
            if(peekaboo_clicked) {
                console.log("hide your face!");
            }
            if(peekaboo_ready) {
                sendBoo();
            }
        } else {
            if(peekaboo_clicked) {
                peekaboo_ready = true;
                sendPeek();
            }
        }

        window.requestAnimationFrame(predictWebcam);
    });
}





var face_model = undefined;
var local_children = [];

blazeface.load().then((loaded_model) => {
    face_model = loaded_model;
});

function detectFaces() {
    face_model.estimateFaces(localVid, false).then((predictions) => {
        if(predictions.length > 0) {
            for(let i = 0; i < local_children.length; i++) {
                document.getElementById('local-wrapper').removeChild(local_children[i]);
            }
            local_children.splice(0);

            for (let i = 0; i < predictions.length; i++) {
                if(predictions[i] && predictions[i].probability > 0.995) {

                    if(peekaboo_clicked) {
                        console.log("hide your face!");
                        $('#pkb-msg').html("Hide your face!");
                    }
                    if(peekaboo_ready) {
                        sendBoo();
                    }

                    if(pirate_clicked) {
                        const hat = document.createElement("img");
                        hat.src = "../assets/hat.png";
                        hat.setAttribute("class", "hat");
                        hat.style = 
                            // "right: " + (Math.round(predictions[i].topLeft[0]) + 100) + "px; " +
                            // "top: " + (Math.round(predictions[i].topLeft[1]) - 50) + "px; " +
                            // "width: " + (Math.round(predictions[i].bottomRight[0] - predictions[i].topLeft[0]) + 200) + "px;";
                            "right: " + (predictions[i].topLeft[0] - 50) + "px; " +
                            "top: " + (predictions[i].topLeft[1] - 125) + "px; " +
                            "width: " + (predictions[i].bottomRight[0] - predictions[i].topLeft[0] + 100) + "px;";
        
                        document.getElementById('local-wrapper').appendChild(hat);
                        local_children.push(hat);
                    } else {
                        for(let i = 0; i < local_children.length; i++) {
                            document.getElementById('local-wrapper').removeChild(local_children[i]);
                        }
                        local_children = []
                    }
                } else {
                    if(peekaboo_clicked) {
                        peekaboo_ready = true;
                        sendPeek();
                        $('#pkb-msg').html("");
                    }
                }
            }
        } else {
            for(let i = 0; i < local_children.length; i++) {
                document.getElementById('local-wrapper').removeChild(local_children[i]);
            }
            local_children = []
        }

        window.requestAnimationFrame(detectFaces);
    });
}


var remote_children = [];

function drawHat() {
    face_model.estimateFaces(document.getElementById("remoteVideo"), false).then((predictions) => {
        if(predictions.length > 0) {
            for(let i = 0; i < remote_children.length; i++) {
                document.getElementById('remote-wrapper').removeChild(remote_children[i]);
            }
            remote_children.splice(0);

            for (let i = 0; i < predictions.length; i++) {
                if(predictions[i] && predictions[i].probability > 0.990) {
                    
                    const hat = document.createElement("img");
                    hat.src = "../assets/hat.png";
                    hat.setAttribute("class", "hat");
                    hat.style = 
                        "right: " + (predictions[i].topLeft[0] - 50) + "px; " +
                        "top: " + (predictions[i].topLeft[1] - 125) + "px; " +
                        "width: " + (predictions[i].bottomRight[0] - predictions[i].topLeft[0] + 100) + "px;";
    
                    document.getElementById('remote-wrapper').appendChild(hat);
                    remote_children.push(hat);
                }
            }
        } else {
            for(let i = 0; i < remote_children.length; i++) {
                document.getElementById('remote-wrapper').removeChild(remote_children[i]);
            }
            remote_children = []
        }

        if(toggle_pirate) {
            window.requestAnimationFrame(drawHat);
        } else {
            for(let i = 0; i < remote_children.length; i++) {
                document.getElementById('remote-wrapper').removeChild(remote_children[i]);
            }
            remote_children = []
        }
    });
}





