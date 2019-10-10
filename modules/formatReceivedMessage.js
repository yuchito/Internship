const Message = require('../models/message');
var xpath = require('xpath'),
    dom = require('xmldom').DOMParser

    // This is a generic function to parse the xml and extract from the HL7 message the data needed
    // And then return the received message and the attributes
formatMessage = function(entry) {
    var doc = new dom().parseFromString('' + entry);
    // Access to the date and HL7 message content in the XML response
    var receivedDate = xpath.select("string(//connectorMessage/receivedDate/time)", doc);
    var hl7Content = xpath.select("string(//connectorMessage/raw/content)", doc);
    dataType = xpath.select("string(//connectorMessage/raw/dataType)", doc);
    if(hl7Content.toLowerCase().includes('msh')) {
        // Retrieving Data : system_name, facility_id, date, ack/nack
        msgType = hl7Content.split('|')[8].split('^')[1];
        pid = hl7Content.split('PID');
        pid = pid[1];
        pid = pid.split('|');
        response = xpath.select("string(//connectorMessage/response/content)", doc);
        ackNack = true;
        if (response.includes('|AA|')) {
            ackNack = true;
        } else if (response.includes('|AE|')) {
            ackNack = false;
        }
        message = new Message({
            type : msgType,
            isReceived : true,
            date : new Date(Number(receivedDate)),
            externalsystem : (pid[2].split('^')[3]).toLowerCase(),
            facility : (pid[3].split('^')[3]).toLowerCase(),
            ackNack : ackNack
        });

        return message;
    }


    

    return null;
}
module.exports = formatMessage;