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

var client = 0;

var peekaboo_clicked = false;
var peekaboo_ready = false;

var pirate_clicked = false;

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
    BOO: 7
};

btn1.on("click", () => {
    getWebcam();
    btn2.prop("disabled", true);
    destination = "ws://" + location.host + "/client1";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;

    client = 1;
    mainScreen();
});

btn2.on("click", () => {
    getWebcam();
    btn1.prop("disabled", true);
    destination = "ws://" + location.host + "/client2";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;

    client = 2;
    mainScreen();
});

hiBtn.on("click", () => {
    console.log("hi btn pressed");
    console.log(peerConnection);
    if(peerConnection) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.INTERACTION,
                message: "Hi Rhys!"
            })
        )
    }
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
    console.log(pirate_clicked);
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

    $('#localVideo').removeClass('large-local');
    $('#localVideo').addClass('mini-local');

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
            }
            break;
        case MessageType.BOO:
            if(client == 2) {
                console.log(msg.message + " received");
                pkbBtn.addClass('join-button-hover');
                pkbBtn.prop('disabled', false);
                drumroll.stop();
                tada.play();

                serverConnection.send(
                    JSON.stringify({
                        type: MessageType.INTERACTION_COMPLETE,
                        message: "peekaboo"
                    })
                )
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
var children = [];

blazeface.load().then((loaded_model) => {
    face_model = loaded_model;
});

function detectFaces() {
    face_model.estimateFaces(localVid, false).then((predictions) => {
        if(predictions.length > 0) {
            for (let i = 0; i < predictions.length; i++) {
                if(predictions[i] && predictions[i].probability > 0.995) {

                    if(peekaboo_clicked) {
                        console.log("hide your face!");
                    }
                    if(peekaboo_ready) {
                        sendBoo();
                    }


                    if(pirate_clicked) {
                        for(let i = 0; i < children.length; i++) {
                            document.getElementById('remote-wrapper').removeChild(children[i]);
                        }
                        children.splice(0);
                
                        const hat = document.createElement("img");
                        hat.src = "../assets/hat.png";
                        hat.setAttribute("class", "hat");
                        hat.style = 
                            "right: " + (Math.round(predictions[i].topLeft[0]) + 100) + "px; " +
                            "top: " + (Math.round(predictions[i].topLeft[1]) - 75) + "px; " +
                            "width: " + (Math.round(predictions[i].bottomRight[0] - predictions[i].topLeft[0]) + 200) + "px;";
        
                        document.getElementById('remote-wrapper').appendChild(hat);
                        children.push(hat);
                    } else {
                        for(let i = 0; i < children.length; i++) {
                            document.getElementById('remote-wrapper').removeChild(children[i]);
                        }
                        children = []
                    }
                } else {
                    if(peekaboo_clicked) {
                        peekaboo_ready = true;
                        sendPeek();
                    }

                    for(let i = 0; i < children.length; i++) {
                        document.getElementById('remote-wrapper').removeChild(children[i]);
                    }
                    children = []
                }
            }
        } else {
            for(let i = 0; i < children.length; i++) {
                document.getElementById('remote-wrapper').removeChild(children[i]);
            }
            children = []
        }

        window.requestAnimationFrame(detectFaces);
    });
}





