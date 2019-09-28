var express = require('express');
var router = express.Router();

var parseString = require('xml2js').parseString;
var request = require('request');

// constructor function 
function system (name,last_message_received,last_message_sent){
    // add patients-wounds-measurements
    this.name = name;
    this.last_message_received = last_message_received;
    this.last_message_sent = last_message_sent;
}


router.get('/',(req, res, next)=>{
    request.get({url : "https://app-15086.on-aptible.com/api/channels/47755bd5-d542-4256-80fb-63b92b4d93b6/messages/?includeContent=true&offset=0&limit=20",
    proxy: 'http://10.23.201.11:3128',
    headers : {
        responseType:'application/xml',
        Accept:  'application/xml',
        'Access-Control-Allow-Origin' : '*',
        Authorization : 'Basic ' + 'YWRtaW46RWthcmUxMjNA'
   
   }}, (error,response,body)=>{
        if (error){
            return console.dir(error);
        }
        parseString(body,function(e, r){
            console.log(r);
            let receivedDate = r.list.message[0].receivedDate[0].time;

            // r.list.message[0].connectorMessages[0].entry.forEach(element => {
                // let connectorName = element.connectorMessage[0].connectorName;
                        

                        // let sendDate = r.list.m.sendDate[0].time;

                        // sendDate = Number(sendDate); 
                        receivedDate = Number(receivedDate)// cast it to a Number
                        // var sDate = new Date(sendDate);
                        var rDate = new Date(receivedDate);
                        var msgObj = new system('Exeter', rDate ,"sDate");
                        
                        res.json(msgObj);
                 
                

  
            
            
             
             
        });
});
});
module.exports = router;
