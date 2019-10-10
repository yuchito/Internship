var express = require('express');
var router = express.Router();
var axios = require('axios');
const config = require('../config');
var btoa = require('btoa');
const sequelize = require('sequelize');
var ExternalSystem = require('../models/externalSystem');
var getMessagesFromXML = require('../modules/getMessagesFromXml');
var Channel = require('../models/channel');




// Create route to get messages per external system
router.get('/:systemName', async(req, res, next)=>{
    // Retreive external systems from database
    externalsystem = await ExternalSystem.findOne({
        where: sequelize.where(
            sequelize.fn('lower', sequelize.col('name')),
            sequelize.fn('lower', req.params.systemName)
        ) 
    });
    
    // Initialize response 
    systemName = req.params.systemName;
    let resp = {
        last_message_received: "",
        last_message_sent: ""
    };
    if (!externalsystem) {
        res.statusCode = 404;
        return res.json("Not Found");
    }
    /*systems.forEach(elem => {
        resp[elem.name.toLowerCase()] = {};
        resp[elem.name.toLowerCase()]["last_message_received"] = "";
        resp[elem.name.toLowerCase()]["last_message_sent"] = "";
        

    });*/

    // Retrieve channels from database
    let channels = await Channel.findAll();
    // Here we need get messages from the mirth API for each channel 
    channels.forEach(elem => {
        // var doc = new dom().parseFromString('' + elem);
        urlsMessagesPerChannel = [];
        url = config.mirth.url + 'channels/' + elem.id.trim() + '/messages';
        urlsMessagesPerChannel.push(url)
    });

    // Loop through the urls array 
    await Promise.all(urlsMessagesPerChannel.map(async url => {
            // Now we have te response object
            response = await axios.get(url + '?includeContent=true&offset=0&limit=20', {
            // Comment the proxy option
            proxy: {
                host: '10.23.201.11',
                port: 3128,
            },
            headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
        
        });
        if(response.status != 200) {
            res.json('error')
        } else {
            // For each system we pass the response data to getMessagesFromXML funct
            // This function will do the parsing and return the needed data
            let messages = await getMessagesFromXML(response.data);
            messages.filter((value, index, aray) => {
                // Keep only the external system provided in the request
                return (value.externalsystem === req.params.systemName);
            });
            // Now we have all the messages for each system 
            // We need to extract the last received/sent message & we have the message model
            for ( var i in messages) {
                message = messages[i];
                if(message && (message.externalsystem.toLowerCase() === req.params.systemName.toLowerCase())) {
                    if(message.isReceived) {
                        if (resp.last_message_received === "") {
                            resp.last_message_received = message.date;

                        } else {
                            if (new Date(resp.last_message_received) < new Date(message.date)) {
                                resp.last_message_received = message.date
                            }
                        }
                    } else {
                    if (resp.last_message_sent === "") {
                        resp.last_message_sent = message.date;

                    } else {
                        if (new Date(resp.last_message_sent) < new Date(message.date)) {
                            resp.last_message_sent = message.date
                        }
                    }
            }
        }
        }
}
    }));
    return res.json(resp);
        
    
    }); 
    



    // console.log(resp);
    // res.json(resp);
    
    // proxy: 'http://10.23.201.11:3128',
//     headers : {
//         responseType:'application/xml',
//         Accept:  'application/xml',
//         'Access-Control-Allow-Origin' : '*',
//         Authorization : 'Basic ' + 'YWRtaW46RWthcmUxMjNA'
   
//    }}, (error,response,body)=>{
//         if (error){
//             return console.dir(error);
//         }
//         parseString(body,function(e, r){
//             console.log(r);
//             let receivedDate = r.list.message[0].receivedDate[0].time;

//             // r.list.message[0].connectorMessages[0].entry.forEach(element => {
//                 // let connectorName = element.connectorMessage[0].connectorName;
                        

//                         // let sendDate = r.list.m.sendDate[0].time;

//                         // sendDate = Number(sendDate); 
//                         receivedDate = Number(receivedDate)// cast it to a Number
//                         // var sDate = new Date(sendDate);
//                         var rDate = new Date(receivedDate);
//                         var msgObj = new system('Exeter', rDate ,"sDate");
                        
//                         res.json(msgObj);
                 
                

  
            
            
             
             
//         });
//     });

module.exports = router;