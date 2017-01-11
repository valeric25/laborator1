/**
 * Created by Vlad on 02-Oct-16.
 */
var fs = require('fs');

exports.getMessagesFromStorage = function(callback) {

    // set size of file in bytes
    var stats = fs.statSync("./Storage/file.txt");
    var fileSizeInBytes = stats["size"];


    if (fileSizeInBytes > 0) fs.readFile('./Storage/file.txt', 'utf8', function (err, contents){

        var dictionary = {};
        if (err) {
            callback("Error to read file", dictionary);
        } else {
            dictionary = JSON.parse(contents);
            callback(null, dictionary);
        }
    });
};

exports.saveDataInFile = function(data, callback) {
    // save message gueue
    fs.writeFile('./Storage/file.txt', JSON.stringify(data), function (err) {
        if (err) {
            callback("Error to save data");
        } else  {
            callback("Messages saved successfully to file.txt!");
        }
    });
};