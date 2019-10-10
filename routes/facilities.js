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
const Channel = require('../models/channel');

const sequelize = require('sequelize');






router.get('/:systemName', async(req,res,next) =>{
    // Get external systems from database
    externalsystem = await ExternalSystem.findOne({
        where: sequelize.where(
            // Create object representing a databse function & and another one representing a DB column
            sequelize.fn('lower', sequelize.col('name')),
            sequelize.fn('lower', req.params.systemName)
        ) 
    });
    
    if (!externalsystem) {
        res.statusCode = 404;
        return res.json("Not Found");
    }
    // Get facilities from DB
    facilities = await Facility.findAll({ where: { es: externalsystem.id } });
    systemName = req.params.systemName;
    // Initialize response 
    let resp = {
        sites: {}
    };

    facilities.forEach(facility => {
        // Construct the JSON response
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
    // The array that will contains the data coming from mirth API
    urlsMessagesPerChannel = [];
    response = await axios.get(config.mirth.url + 'channels/idsAndNames', {
        // proxy: {
        //     host: '10.23.201.11',
        //     port: 3128,
        // },
        headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
    });

    // var doc = new dom().parseFromString(response.data);
    var channels = await Channel.findAll({attributes: ['id']});
    channels.forEach(elem => {
        //var doc = new dom().parseFromString('' + elem);
        url = config.mirth.url + 'channels/' + elem.id.trim() + '/messages';
        //url += '?includeContent=true&offset=0&limit=20';
        urlsMessagesPerChannel.push(url);
        // console.log(urlsMessagesPerChannel);
    });

        // Loop through the urls array 
    await Promise.all(urlsMessagesPerChannel.map(async url => {
        response = await axios.get(url + '?includeContent=true&offset=0&limit=20', {
            // Proxy config
            // proxy: {
            //     host: '10.23.201.11',
            //     port: 3128,
            // },
            headers: { Authorization: 'Basic ' + btoa(config.mirth.user + ':' + config.mirth.password) }
        });
        if (response.status !== 200) {
            return res.json('error');
        } else {
            // For each system we pass the response data to getMessagesFromXML funct
            // This function will do the parsing and return the needed data
            let messages = await getMessagesFromXML(response.data);

            messages.filter((value, index, array) => {
            // Keep only the external system provided in the request
                return (value.externalsystem.toLowerCase() === req.params.systemName.toLowerCase());
            });
            for (var i in messages) {
                // Now we have all the messages for each system 
                // We need to extract the last received/sent message for each facility
                // & need to count the total ack/nack of each message
                message = messages[i];
                if (message && (resp.sites[message.facility.toLowerCase()]) && (message.externalsystem.toLowerCase() === req.params.systemName.toLowerCase())) {
                    // Here we extract dates of last message received/sent
                    if (message.isReceived) {
                        if (resp.last_message_received) {
                            if (new Date(resp.last_message_received) < new Date(message.date)) {
                                resp.last_message_received = message.date
                            }
                        } else {
                            resp.last_message_received = message.date;
                        }
                        // If the message type is undefined
                        if (resp.sites[message.facility.toLowerCase()].messages_received[message.type] === undefined) {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type] = {};
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].ack = 0;
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].nack = 0;
                        }
                        // ackNack = true => message is acknowledged ack+=1
                        // ackNack = false => message is not acknowledged nack+=1
                        if (message.ackNack) {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].ack++
                                resp.sites[message.facility.toLowerCase()].messages_received.all.ack++
                        } else {
                            resp.sites[message.facility.toLowerCase()].messages_received[message.type].nack++;
                            resp.sites[message.facility.toLowerCase()].messages_received.all.nack++;
                        }
                    } else {
                        // Same way we handle sent messages 
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

 
       

  
          
                    
                    
                   
                
                
                
                
    

      

            
             
             
        


module.exports = router;
