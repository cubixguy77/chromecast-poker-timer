window.onload = function () {
    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    // handler for the 'ready' event
    castReceiverManager.onReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");
        startApp();        
    };

    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function (event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };

    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function (event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
    };

    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function (event) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
            event.data['muted']);
    };

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.countdown.timer');

    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function (event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);

        var messages = event.data.split(",");
        var eventType = messages[0];

        if (eventType == "play") {
            var duration = messages[1];
            startTimer(duration);
        }
        else if (eventType == "pause") {
            pause();
        }
        else if (eventType == "resume") {
            resume();
        }
        else if (eventType == "stop") {
            stop();
        }

        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    }

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({ statusText: "Application is starting" });
    console.log('Receiver Manager started');
};

function startApp() {
    displayText("Set a time in the app");
}

var secondsRemaining;
var paused = false;
var timer;

var timerFunction = function () {
    if (paused)
        return;

    if (!timer)
        return;
    
    displayText(renderTimer(secondsRemaining));

    if (--secondsRemaining < 0) {
        timesUp();        
    }
};

function timesUp() {
    playSound("time_expired");
    clearInterval(timer);
}

function startTimer(durationInSeconds) {
    secondsRemaining = durationInSeconds;
    timer = setInterval(timerFunction, 1000);
}

function pause() {
    paused = true;
}

function resume() {
    paused = false;
}

function stop() {
    if (timer != null) {
        clearInterval(timer);
        timer = null;
        startApp();
    }
}

function playSound(soundObj) {
    var sound = document.getElementById(soundObj);
    sound.play();
}

function renderTimer(secondsRemaining) {
    var minutes = parseInt(secondsRemaining / 60, 10);
    var seconds = parseInt(secondsRemaining % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}

function displayText(text) {
    console.log(text);
    document.getElementById("message").innerHTML = text;
    window.castReceiverManager.setApplicationState(text);
};