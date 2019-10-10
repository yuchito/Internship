const formatReceivedMessage = require('./formatReceivedMessage');
const formatSentMessage = require('./formatSentMessage');

var xpath = require('xpath')
  , dom = require('xmldom').DOMParser

 // This is a generic function to parse the xml and browsw the messages
 // Then extract from the HL7 message the data needed

getMessagesFromXML = function(str) {
   var  _messages = [];
    // str parsing
    var doc = new dom().parseFromString(str);
    var messages = xpath.select("/list/message/connectorMessages", doc);
    // Loop to browse the entries
    messages.forEach(msg => {
        var doc = new dom().parseFromString('' + msg);
        // Get the message where metadata_Id = 0 : that means the channel is a Source
        // So this is a received message from an external system
        var entryReceived = xpath.select("//entry[int='0']", doc);
        if (formatReceivedMessage(entryReceived)) {
            _messages.push(formatReceivedMessage(entryReceived));
        }
        // Otherwise if metadata_id != 0 : that means the message either is 
        // sent to another channel or outside so we add the condition last()
        // this way we get the outgoing message 
        var entrySent = xpath.select("//entry[int!='0' and last()]", doc);
        if (formatSentMessage(entrySent)) {
            _messages.push(formatSentMessage(entrySent));
        }
    })

    return _messages;
}
module.exports = getMessagesFromXML;