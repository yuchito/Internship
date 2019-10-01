var express = require('express');
var router = express.Router();

var parseString = require('xml2js').parseString;
var request = require('request');
var axios = require('axios');
const config = require('../config');
var btoa = require('btoa');
var xpath = require('xpath'),
    dom = require('xmldom').DOMParser;




var ExternalSystem = require('../models/externalSystem');
var getMessagesFromXML = require('../modules/getMessagesFromXml');
var Channel = require('../models/channel');





router.get('/', async(req, res, next)=>{

    let systems = await ExternalSystem.findAll();
    let resp = {};
    systems.forEach(elem => {
        resp[elem.name.toLowerCase()] = {};
        resp[elem.name.toLowerCase()]["last_message_received"] = "";
        resp[elem.name.toLowerCase()]["last_message_sent"] = "";


    });

    let channels = await Channel.findAll();
    let data = {};
    channels.forEach(elem => {
        // var doc = new dom().parseFromString('' + elem);
        urlsMessagesPerChannel = [];
        url = config.mirth.url + 'channels/' + elem.id + '/messages';
        console.log(url);
        urlsMessagesPerChannel.push(url)
    });

    await Promise.all(urlsMessagesPerChannel.map(async url => {
        try {
            response = await axios.get(url + '?includeContent=true&offset=0&limit=20', {
            proxy: {
                host: '10.23.201.11',
                port: 3128,
            },
            headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
        });
    } catch (err) {
        res.json(err)
    }
        
    
    })); 
    console.log(resp);
return res.json(resp);




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
});
module.exports = router;