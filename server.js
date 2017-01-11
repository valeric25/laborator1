/**
 * Created by Vlad on 02-Oct-16.
 */
var st = require('./Storage/storage');
var Message = require('./Model/message');

var net = require("net");
//load filestream for read/write ops
var fs = require('fs');

//Queue for message storage
var messages = {};
var sockets = [];
var subscribers = {};
var host = "0.0.0.0";
var port = 5000;


//TCP server creation
var server = net.createServer(function(socket){
    socket.name = socket.remoteAddress + ":" + socket.remotePort;
    console.log("Client connected: " + socket.name);

    // all conected users
    sockets.push(socket);

    socket.on("data", function(data){
        var msg = JSON.parse(data);
        /*console.log(msg.type);
        console.log("Client transmitted: " +msg.text);
        console.log(msg.msg_queue);*/

        //switch for determine type operation(push or pop) from queue
        switch(msg.type){
            case "post":

               // verify if this queue exist
                if (messages[msg.queue]) {

                    // add array for this queue
                    var obj = messages[msg.queue];

                    // add current message
                    obj.push(msg.text);

                    // set array for queue
                    messages[msg.queue] = obj;

                } else {
                    // create new queue
                    var arr = [];
                    arr.push(msg.text);
                    messages[msg.queue] = arr;
                }
                console.log(messages);

                // send mess to all subscribers
                sockets.forEach(function (socket, index, array) {
                    if (subscribers[socket.remotePort]){
                        // if port exist in subscribers list
                        var q = [];
                        q = subscribers[socket.remotePort];
                        for (var i=0; i<qs.length; i++){
                            if (qs[i] == msg.queue) {

                                var mess = new Message(msg.queue, "post", msg.text, "");
                                socket.write(JSON.stringify(mess));
                            }
                        }
                    }
                });
                break;
                /*console.log("Sending...");
                messages.push(msg.text.trim()); //push message to queue
                saveFile();
                break;*/
            case "get":
                // verify if exist this queue
                if (messages[msg.queue]) {

                    // if queue has messages
                    if (messages[msg.queue].length > 0){
                        // take first message from queue ->(messages[msg.queue])[0]
                        var mess = new Message(msg.queue, "post", (messages[msg.queue])[0], "");
                        socket.write(JSON.stringify(mess));
                        // delete first element
                        messages[msg.queue].splice(0,1);
                    } else {
                        // coada nu mai are mesaje
                        var mess = new Message(msg.queue, "post", "", "No more messages in this queue");
                        socket.write(JSON.stringify(mess));
                    }
                    //socket.write(JSON.stringify(response));

                } else {
                    //specified queue doesn't exist
                    //var mess = new Message(msg.queue, "post", "", "Queue doesn`t exist");
                    var mess = new Message(msg.queue, "post", "", "Queue doesn`t exist");
                    socket.write(JSON.stringify(mess));
                }
                console.log(messages);

                st.saveDataInFile(messages, function (status) {
                    console.log(status);
                });
                break;

            case "subscribe":
                if (messages[msg.queue]){
                    // if exists queue

                    if (subscribers[socket.remotePort]) {
                        // if exist this client in subscribers list
                        var array = subscribers[socket.remotePort];
                        array.push(msg.queue);
                        subscribers[socket.remotePort] = array;

                    } else {
                        var array = [];
                        array.push(msg.queue);
                        subscribers[socket.remotePort] = array;
                    }

                    console.log(socket.name + " subscribed to: " + msg.queue);
                    // send response
                    var mess = new Message(msg.queue, "post", "Subscribe succesed", "");
                    socket.write(JSON.stringify(mess));


                } else {
                    // error subscribe for non-existing queue
                    var mess = new Message(msg.queue, "post", "", "Unable to subscribe for a non-existent queue");
                    socket.write(JSON.stringify(mess));
                }
                //view all subscribers
                console.log(subscribers);
                break;

            case "unsubscribe":

                if (subscribers[socket.remotePort]) {

                    var user_queues = [];
                    user_queues = subscribers[socket.remotePort];
                    if (user_queues.length > 0) {

                        // if name of queue exist in array, then delete them
                        for (var i=0; i<user_queues.length; i++) {
                            // if array has queue
                            if (user_queues[i] == msg.queue) {
                                // retrieve index for element
                                var index = user_queues.indexOf(user_queues[i]);
                                if (index > -1) {
                                    // delete element from array
                                    user_queues.splice(index, 1);
                                }

                                if (user_queues.length == 0 ) {
                                    // delete user from subscribers
                                    delete subscribers[socket.remotePort];
                                }
                                // respond to receiver
                                var mess = new Message(msg.queue, "post", "", "Unsubscribed succeded");
                                socket.write(JSON.stringify(mess));
                            }
                        }
                    }
                } else {
                    var mess = new Message(msg.queue, "post", "", "You are not subscribed to perform unsubscribe");
                    socket.write(JSON.stringify(mess));
                }
                console.log(subscribers);
                break;
        }

         //save queues in file
        st.saveDataInFile(messages, function (status) {
            console.log(status);
        })
    });

    socket.on("error", function(err){
       // saveFile();
        //console.log(ex);
        console.log("Messages from queue saved to file.")
    });


    socket.on("close", function(){
        console.log("Client " + socket.name + " disconnected!");
        var index = sockets.indexOf(socket);
        if(index > -1){
            sockets.splice(index, 1);
        }
        console.log("Nodes connected" + sockets.length);
    });
}).
listen(port, host, function(){
    console.log("-----Server on!-----");

});

st.getMessagesFromStorage(function (err, data) {

    if(err){
        console.log(err);
    } else {
        console.log("Load data with success" );
        messages = data;
        console.log(messages);
    }

});
