var express = require('express');
var router = express.Router();
const Channel = require('../models/channel');
//const db = require('../config/database');
//var btoa = require('btoa');
var parseString = require('xml2js').parseString;
var request = require('request');
var promise = require('promise');

// constructor function 
function system (name,messages_received,messages_sent){
    // add patients-wounds-measurements
    this.name = name;
    this.messages_received = messages_received;
    this.messages_sent = messages_sent;
}
function messages (ack,nack){
    this.ack = ack;
    this.nack = nack; 
}

router.get('/', (req, res, next) => {

   
     var urls = ["https://app-15086.on-aptible.com/api/channels/47755bd5-d542-4256-80fb-63b92b4d93b6/messages/?includeContent=true&offset=0&limit=20",
    "https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/?includeContent=true&offset=0&limit=20"];
    var responses = [];
    var completed_requests = 0;

        urls.forEach(uri => {
    
            request.get({url: uri, 
                headers : {
                     responseType:'application/xml',
                     Accept:  'application/xml',
                     'Access-Control-Allow-Origin' : '*',
                     Authorization : 'Basic ' + 'YWRtaW46RWthcmUxMjNA'
                
                }},(error, response, body)=>{
                    if(error) {
                        return console.dir(error);
                    }
                    
                    parseString(body,function(e,r){
                        
                        let data = JSON.parse(JSON.stringify(r));
                        // delete data[list];
                        // res.json(
                        //     data
                        // );
                         // create an instance
                         let sent_ack_count = 0;
                         let sent_nack_count = 0;
                         let received_ack_count = 0;
                         let received_nack_count = 0;
                         r.list.message.forEach(msg => {
                                msg.connectorMessages[0].entry.forEach(element => {
                                    let connectorName = element.connectorMessage[0].connectorName;
                                    if(connectorName.toString() === "Processing" ){

                                        let sent = element.connectorMessage[0].sent[0].content[0];
                                        sent_nack_count += ((sent.match( /AE/g) || []).length) ;
                                        sent_ack_count += ((sent.match( /AA/g) || []).length) ;
                                        let response = element.connectorMessage[0].response[0].content[0];
                                        received_nack_count += ((response.match( /AE/g) || []).length) ;
                                        received_ack_count += ((response.match( /AA/g) || []).length) ; 
                                    }
                                
                         });
                         //console.log("ack: "+ack_count+" "+"nack: " + nack_count );
                            
                        var systemObj = new system ('Exeter',
                        new messages(received_ack_count,received_nack_count),
                        new messages(sent_ack_count,sent_nack_count));
                       
                        //console.log(systemObj);
                        responses.push(systemObj);
                        completed_requests++;
                        if(completed_requests === urls.length){
                            //console.log(JSON.parse(JSON.stringify(responses)));

                            res.json(JSON.parse(JSON.stringify(responses)));
                        }



                        
                        
                    });
                });
  
        });

            
                
        
        /*parseString(body, function(err,result){
            let data = JSON.stringify(result);
            console.log(data);
            let systems = JSON.parse(data);
            res.json(systems);*/
});
router.route('/id').get( (req, res, next) => {
    
    request.get({url : "https://app-15086.on-aptible.com/api/channels/47755bd5-d542-4256-80fb-63b92b4d93b6/messages/?includeContent=true&offset=0&limit=20", 
    headers : {
         responseType:'application/xml',
         Accept:  'application/xml',
         'Access-Control-Allow-Origin' : '*',
         Authorization : 'Basic ' + 'YWRtaW46RWthcmUxMjNA'
    
    }},(error, response, body)=>{
        if(error) {
            return console.dir(error);
        }
        
        parseString(body,function(e,r){
            let data = JSON.parse(JSON.stringify(r));
            // delete data[list];
            // res.json(
            //     data
            // );
             // create an instance
             let sent_ack_count = 0;
             let sent_nack_count = 0;
             let received_ack_count = 0;
             let received_nack_count = 0;
             r.list.message.forEach(msg =>{
                    msg.connectorMessages[0].entry.forEach(element => {

                    let connectorName = element.connectorMessage[0].connectorName;
                    if(connectorName.toString() === "Processing" ){
                        let sent = element.connectorMessage[0].sent[0].content[0];
                        sent_nack_count += ((sent.match( /AE/g) || []).length) ;
                        sent_ack_count += ((sent.match( /AA/g) || []).length) ;
                        let response = element.connectorMessage[0].response[0].content[0];
                        
                        

                        received_nack_count += ((response.match( /AE/g) || []).length) ;
                        received_ack_count += ((response.match( /AA/g) || []).length) ;  
                }
                    
             });
            });
             //console.log("ack: "+ack_count+" "+"nack: " + nack_count );
                
            var systemObj = new system ('ADT',
            new messages(received_ack_count,received_nack_count),
            new messages(sent_ack_count,sent_nack_count));
            res.json(systemObj);
        });
    /*Channel.findById(req.params.id)
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ messgae: 'Channel not found!' });
            }
        });*/
    });
});
});



    
    

//     var xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
//     parseString(xml, function(err,result){
//         let data = JSON.stringify(result);
//         console.log(data);
//         let systems = JSON.parse(data);
//         res.json(systems);

//     });

    // res.statusCode = 200;
    // res.setHeader('Content-type', 'application/json');
    // const fs = require('fs');
    // fs.readFile('public/json/systems.json', (err, data) => {
    //     if (err) throw err;
    //     let systems = JSON.parse(data);
    //     console.log(systems);
    //     res.json(systems);
    // });
    /*Channel.findAll()
        .then((docs) => {
            res.json({
                message: 'Fetching data successfuly',
                channels: docs
            });
        }, (err) => next(err))
        .catch((err) => next(err));*/
        //});

router.post('/', (req, res, next) => {
    const channel = new Channel({
        title: req.body.title,
        content: req.body.content
    });
    channel.save((err, doc) => {
        if (!err) {
            res.status(200).json({
                message: 'Channel added successfuly',
                Channel: doc
            });
            console.log(doc);
        } else {
            console.log("error adding new Channel");
            res.status(201).json({
                message: 'Channel added falied',
                channel: null
            });
        }
    });
});

router.delete('/:id', (req, res, next) => {

    Channel.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            console.log(doc);
            res.json({
                message: 'The record has been deleted',
                channel: doc
            });
        } else {
            res.status(201).json({
                message: 'Delete failed',
                channel: null
            });
        }
    });
});

router.put('/:id', (req, res, next) => {
    const channel = new Channel({
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
    });

    Channel.updateOne({ _id: req.params.id }, channel, (err, doc) => {
            if (!err) {
                console.log(doc);
                res.status(200).json({
                    message: 'update successful!',
                    channel: doc
                });
            } else {
                console.log(result);
                res.status(300).json({
                    message: 'update failed!',
                    channel: null
                });
            }
        })
        /*.then(result => {
            console.log(result);
            res.status(200).json({
                message: 'update successful!',
                channel: result
            });
        });*/
});




module.exports = router;