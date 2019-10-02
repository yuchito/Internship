const formatReceivedMessage = require('./formatReceivedMessage');
const formatSentMessage = require('./formatSentMessage');

var xpath = require('xpath')
  , dom = require('xmldom').DOMParser


getMessagesFromXML = function(str) {
    var  _messages = [];
    // str parsing
    var doc = new dom().parseFromString(str);
    var messages = xpath.select("/list/message/connectorMessages", doc);
    messages.forEach(msg => {
        var doc = new dom().parseFromString('' + msg);
        var entryReceived = xpath.select("//entry[int='0']", doc);
        if (formatReceivedMessage(entryReceived)) {
            _messages.push(formatReceivedMessage(entryReceived));
        }
        var entrySent = xpath.select("//entry[int!='0' and last()]", doc);
        // if (formatSentMessage(entrySent)) {
        //     _messages.push(formatSentMessage(entrySent));
        // }
        // var sents = xpath.select("//entry[int!='0']", doc);
    });

    return _messages;
}
module.exports = getMessagesFromXML;