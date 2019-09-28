var express = require('express');
var router = express.Router();

var parseString = require('xml2js').parseString;
var request = require('request');

var xpath = require('xpath')
  , dom = require('xmldom').DOMParser

function system (last_message_received, last_message_sent, sites){
    this.last_message_received = last_message_received;
    this.last_message_sent = last_message_sent;
    this.sites = sites;
}

function facility (site_name, messages_received, messages_sent){
    this.site_name = site_name;
    this.messages_received = messages_received;
    this.messages_sent = messages_sent;
}

function messages(ack,nack){
    this.ack = ack;
    this.nack = nack; 
}

router.get('/:facilityId',(req, res, next)=>{
    var urls = ["https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/1",
    "https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/2","https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/3"];
    var responses = [];
    var completed_requests = 0;
    var facility_id; 
       

    urls.forEach(uri =>{
        request.get({url : uri,
        proxy: 'http://10.23.201.11:3128', // if having internet access directly, comment this line 
        headers : {
            responseType:'application/xml',
            Accept:  'application/xml',
            'Access-Control-Allow-Origin' : '*',
            Authorization : 'Basic ' + 'YWRtaW46RWthcmUxMjNA'
    
    }}, (error,response,body)=>{
            if (error){
                return console.dir(error);
            }
            parseString(body, function(e, r){
                let sDate;
                let rDate;
                let triggerEvent;
                let sent_ack_count = 0;
                let sent_nack_count = 0;
                let received_ack_count = 0;
                let received_nack_count = 0;
                    r.message.connectorMessages[0].entry.forEach(element => {
                        let connectorName = element.connectorMessage[0].connectorName;
                        if(connectorName.toString() === "Processing" ){
                            let sendDate = element.connectorMessage[0].sendDate[0].time;
                            let receivedDate = element.connectorMessage[0].receivedDate[0].time;

                            sendDate = Number(sendDate); 
                            receivedDate = Number(receivedDate)// cast it to a Number
                            sDate = new Date(sendDate);
                            rDate = new Date(receivedDate);

                            let sent = element.connectorMessage[0].channelMapContent[0].content[0].entry[95].string[1];
                            // ack-nack results
                            //console.log(sent);
                            sent_nack_count += ((sent.match( /AE /g) || []).length) ;
                            sent_ack_count += ((sent.match( /AA /g) || []).length) ;

                            //trigger event type
                            triggerEvent = element.connectorMessage[0].channelMapContent[0].content[0].entry[84].string[1];
                            console.log(triggerEvent);
                            
                            
                            let xmlContent = element.connectorMessage[0].channelMapContent[0].content[0].entry[53].string[1];
                            var doc = new dom().parseFromString(xmlContent)
                                    nodes = xpath.select("//MSH.4.1",doc);
                                    facility_id = nodes[0].firstChild.data
                                    //responses.push(nodes[0].firstChild.data);

                            
                        }
                    });
                    
                    
                    sys = new system(rDate, sDate,
                        { [facility_id] : new facility("Georgetown",{["all"]:
                        new messages(sent_ack_count,sent_nack_count),[triggerEvent]:new messages(sent_ack_count,sent_nack_count)},
                        new messages(sent_ack_count,sent_nack_count))});
                        //{"sites": new facility(facility_id,new messages(1,2),new messages(2,1))});
                    
                        responses.push(sys);
                        completed_requests++;
                        //console.log(completed_requests);
                        if(completed_requests === urls.length){
                            //console.log(JSON.parse(JSON.stringify(responses)));

                           res.json(JSON.parse(JSON.stringify(responses)));
                           //let data = JSON.parse(JSON.stringify(element));
                           //res.json(data);
                        }
                
                
                
                
                // let data = JSON.parse(JSON.stringify(r));
                // console.log(data);
                // res.json(data);
                
                
                //res.end();
                
            });
                
                    //console.log(JSON.stringify(sys));

        });
    });
                

                

}); 
    

      

            
             
             
        


module.exports = router;
