const Message = require('../models/message');
var xpath = require('xpath'),
    dom = require('xmldom').DOMParser

    // This is a generic function to parse the xml and extract from the HL7 message the data needed
    // And then return the sent message and the attributes
formatMessage = function(entry) {
    var doc = new dom().parseFromString('' + entry);
    var sendDate = xpath.select("string(//connectorMessage/sendDate/time)", doc);

    /*var hl7Content = xpath.select("string(//connectorMessage/raw/content)", doc);
    dataType = xpath.select("string(//connectorMessage/raw/dataType)", doc);
    if(hl7Content.toLowerCase().includes('msh')) {
        msgType = hl7Content.split('|')[8].split('^')[1];
        pid = hl7Content.split('PID');
        pid = pid[1];
        console.log(hl7Content);
        pid = pid.split('|');
        response = xpath.select("string(//connectorMessage/response/content)", doc);
        ackNack = true;
        if (response.includes('|AA|')) {
            ackNack = true;
        } else if (response.includes('|AE|')) {
            ackNack = false;
        }*/
        message = new Message({
            type : 'R01',
            isReceived : false,
            date : new Date(Number(sendDate)),
            externalsystem : 'medstar',
            facility : 'GUH',
            ackNack : true
        });

        return message;
    }


    


module.exports = formatMessage;