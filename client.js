/**
 * Created by Vlad on 02-Oct-16.
 */

var Message = require('./Model/message');
//Load the TCP library
var net = require("net");
var prompt = require('prompt');
var client = new net.Socket();
client.setEncoding("utf8");
client.connect(5000, function(){
    console.log("-----client start------");
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

        if (result.queue != "" && result.type != "" && result.text != "") {
            // send to server
            var mess = new Message(result.queue, "post", result.text, "");
            client.write(JSON.stringify(mess));
            console.log("==== Message sent ====");
            console.log("\r");
            risePrompt();
        } else {
            console.log("Empty fields - complete all the fields");
            risePrompt();
        }

    });
}

