/**
 * Created by Vlad on 02-Oct-16.
 */
var Message = require('./Model/message');
// Load the TCP library
var net = require("net");
var fs = require('fs');
var prompt = require('prompt');
var receiver = new net.Socket();
//receiver.setEncoding('utf8');

receiver.connect(5000, function(){
    console.log("-----Receiver started------");
});


receiver.on("data", function(data){

    // parse revieved data
    var msg = JSON.parse(data);

    switch (msg.type) {
        case "post":
            if (msg.error != "" ) {
                console.log("\rProtocol error: " + msg.error);
            } else {
                console.log("\rNew message from queue[" + msg.queue + "]: " + msg.text);
            }
            break;
    }
});


// call prompt after 500ms
setTimeout(function() {
    risePrompt();
},500);

function risePrompt() {
    prompt.start();
    prompt.colors = true;
    prompt.get(['queue', 'type', 'text'], function (err, result) {
        if (err) { return onErr(err);}

        var mess = new Message();
        var msg = {}
        // set values from prompt
        msg.queue = result.queue;
        msg.type = result.type;
        msg.text = result.text;

        if (msg.queue != "" && msg.type != "" && msg.text != "") {
            // send to broget
            receiver.write(JSON.stringify(msg));
            console.log("==== Message sent ====");
            console.log("\r");
            setTimeout(function() {
                risePrompt();
            },500);
        } else {
            console.log("Empty fields - complete all the fields");
            setTimeout(function() {
                risePrompt();
            },500);
        }

    });
}

//on error event
//When miss connection from server, retrieve from file my.json
/*
receiver.on("error", function(ex){
    process.stdin.resume();
    var fs = require('fs');
    var obj;
    fs.readFile('/tmp/my.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        for (var i = 0; i < obj.length && i < data.length; i++) {
            console.log("From file: " + obj[i].toString());
        }
    })

});
*/
