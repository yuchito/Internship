var express = require('express');
var router = express.Router();

var parseString = require('xml2js').parseString;
var request = require('request');
var axios = require('axios');
var btoa = require('btoa');
var xpath = require('xpath')
  , dom = require('xmldom').DOMParser;
const config = require('../config');
const ExternalSystem = require('../models/externalSystem');
const Facility = require('../models/facility');
var getMessagesFromXML = require('../modules/getMessagesFromXml');

const sequelize = require('sequelize');






router.get('/:systemName', async(req,res,next) =>{
    externalsystem = await ExternalSystem.findOne({
        where: sequelize.where(
            sequelize.fn('lower', sequelize.col('name')),
            sequelize.fn('lower', req.params.systemName)
        ) 
    });
    
    if (!externalsystem) {
        res.statusCode = 404;
        return res.json("Not Found");
    }

    facilities = await Facility.findAll({ where: { es: externalsystem.id } });
    systemName = req.params.systemName;
    let resp = {
        sites: {}
    };
    facilities.forEach(facility => {
        /*resp[elem.code] = {};
        resp[elem.code]["site name"]= elem.name;
        // console.log(elem.name);
        // need to add message type
        resp[elem.code]["messages_received"] ={"all": new messages(0, 0),[elem.name]: new messages(0,0)};
        resp[elem.code]["messages_sent"] = {"all": new messages(0, 0)};*/
        resp.sites[facility.code.toLowerCase()] = {};
        resp.sites[facility.code.toLowerCase()].site_name;
        resp.sites[facility.code.toLowerCase()].site_name = facility.name;
        resp.sites[facility.code.toLowerCase()].messages_received = {
            all: {
                ack: 0,
                nack: 0
            }
        };
        resp.sites[facility.code.toLowerCase()].messages_sent = {
            all: {
                ack: 0,
                nack: 0
            }
        };
    });

    urlsMessagesPerChannel = [];
    response = await axios.get(config.mirth.url + 'channels/idsAndNames', {
        proxy: {
            host: '10.23.201.11',
            port: 3128,
        },
        headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
    });

    var doc = new dom().parseFromString(response.data);
    var channels = xpath.select("//entry", doc);
    channels.forEach(elem => {
        var doc = new dom().parseFromString('' + elem);
        url = config.mirth.url + 'channels/' + xpath.select('string(//string)', doc) + '/messages';
        //url += '?includeContent=true&offset=0&limit=20';
        urlsMessagesPerChannel.push(url);
    });
    await Promise.all(urlsMessagesPerChannel.map(async url => {
        response = await axios.get(url + '?includeContent=true&offset=0&limit=20', {
            proxy: {
                host: '10.23.201.11',
                port: 3128,
            },
            headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
        });
        if (response.status !== 200) {
            return res.json('error');
        } else {
            let messages = await getMessagesFromXML(response.data);
            messages.filter((value, index, aray) => {
                return (value.externalsystem === req.params.systemName);
            });
            for (var i in messages) {
                message = messages[i];
                if (message && (resp.sites[message.facility.toLowerCase()]) && (message.externalsystem.toLowerCase() === req.params.systemName.toLowerCase())) {
                    if (message.isReceived) {
                        if (resp.last_message_received) {
                            if (new Date(resp.last_message_received) < new Date(message.date)) {
                                resp.last_message_received = message.date
                            }
                        } else {
                            resp.last_message_received = message.date;
                        }
                        if (resp.sites[message.facility.toLowerCase()].messages_received[message.type] === undefined) {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type] = {};
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].ack = 0;
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].nack = 0;
                        }
                        if (message.ackNack) {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].ack++
                                resp.sites[message.facility.toLowerCase()].messages_received.all.ack++
                        } else {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].nack++;
                            resp.sites[message.facility.toLowerCase()].messages_received.all.nack++;
                        }
                    } else {
                        if (resp.last_message_sent) {
                            if (new Date(resp.last_message_sent) < new Date(message.date)) {
                                resp.last_message_sent = message.date
                            }
                        } else {
                            resp.last_message_sent = message.date;
                        }
                        if (resp.sites[message.facility.toLowerCase()].messages_sent[message.type] === undefined) {
                            resp.sites[message.facility.toLowerCase()].messages_sent[message.type] = {};
                            resp.sites[message.facility.toLowerCase()].messages_sent[message.type].ack = 0;
                            resp.sites[message.facility.toLowerCase()].messages_sent[message.type].nack = 0;
                        }

                        if (message.ackNack) {
                            resp.sites[message.facility.toLowerCase()].messages_sent[message.type].ack++;
                            resp.sites[message.facility.toLowerCase()].messages_sent.all.ack++
                        } else {
                            resp.sites[message.facility.toLowerCase()].messages_sent[message.type].nack++;
                            resp.sites[message.facility.toLowerCase()].messages_sent.all.nack++
                        }
                    }
                }
            }
        }
    }));
    return res.json(resp);    
});

router.get('/:facilityId',(req, res, next)=>{
    var urls = ["https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/1",
    "https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/2","https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/3"];
    var responses = [];
    var completed_requests = 0;
    var facility_id; 
       

    urls.forEach(uri =>{
        request.get({url : uri,
            // proxy: 'http://10.23.201.11:3128', // if having internet access directly, comment this line 
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
