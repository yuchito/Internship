var express = require('express');
var router = express.Router();
const Channel = require('../models/channel');
var axios = require('axios');
var btoa = require('btoa');
var parseString = require('xml2js').parseString;
var request = require('request');
var promise = require('promise');
var ExternelSystem = require('../models/externelSystem');
var Message = require('../models/message');
const formatMessage = require('../modules/formatMessage');
var xpath = require('xpath'),
    dom = require('xmldom').DOMParser;
const config = require('../config');
var getMessagesFromXML = require('../modules/getMessagesFromXml');
// constructor function 
function system(name, messages_received, messages_sent) {
    // add patients-wounds-measurements
    this.name = name;
    this.messages_received = messages_received;
    this.messages_sent = messages_sent;
}

function messages(ack, nack) {
    this.ack = ack;
    this.nack = nack;
}

router.get('/', async(req, res, next) => {

    let systems = await ExternelSystem.findAll();
    let resp = {};
    systems.forEach(elem => {
        resp[elem.name.toLowerCase()] = {};
        resp[elem.name.toLowerCase()]["messages_received"] = new messages(0, 0);
        resp[elem.name.toLowerCase()]["messages_sent"] = new messages(0, 0);
    });

    //http://api-mirth-url//api/channelId/messages
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
    urlsMessagesPerChannel.forEach(async url => {
        try {
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
                messages = getMessagesFromXml(response.data);
                messages.forEach(message => {
                    if (message) {
                        if (message.sent) {
                            message.ackNack ? resp[message.externalsystem].messages_sent.ack++ : resp[message.externalsystem].messages_sent.nack++;
                        } else if (message.received) {
                            message.ackNack ? resp[message.externalsystem].messages_received.ack++ : resp[message.externalsystem].messages_received.nack++;
                        }
                    }
                });
            }

        } catch (err) {
            return res.json(err);
        }
    });
    return res.json(resp);
    str = "MSH|^~\&amp;|GEC|TTT|EKARE|EKARE|201908061212||SIU^S12|H20190806121235.9956|P|2.3|-1||||||||&#xd;SCH|26721328||||||cysto-trus|CYS|15|MIN|^^^201909100900|353060^BANDI MD^GAURAV^^^^^1891750196^107008||||||||JXC74|||||P|||DOC||CYSTO|GUH PHC-4TH FL|UROLOGY-GUH||MU5||||||JXC74|&#xd;NTE|1||sched wpt on 08/06/2019||||&#xd;PID|1|11669410^^^MEDSTAR|1111111121^^^GUH||test^test^MITCHELL^^^^L||19531110|M|||212 MISSISSIPPI AVE SE^APT 201^WASHINGTON^DC^20032||(240)353-1765|||||||||||||||||||||||||||||&#xd;PV1|1|O|GP4||||353060^BANDI MD^GAURAV.^^^^^1891750196||||||||||||26721328|||||||||||||||||||||||||201909100900|||||||||||&#xd;AIS|1||26721328|201909100900|||15|MIN||P|&#xd;AIG|1||353060^BANDI MD^GAURAV^^^^^1891750196^107008|S||||201909100900|||15|MIN||P|&#xd;AIL|1||GP4~GURO|||201909100900|||15|MIN||P|&#xd;AIP|1||353060^BANDI MD^GAURAV^^^^^1891750196^107008|S||201909100900|||15|MIN||P|";
    let message = formatMessage(str);
    if (message) {
        if (message.sent) {
            message.ackNack ? resp[message.externalsystem].messages_sent.ack++ : resp[message.externalsystem].messages_sent.nack++;
        } else if (message.received) {
            message.ackNack ? resp[message.externalsystem].messages_received.ack++ : resp[message.externalsystem].messages_received.nack++;
        }
    }
    return res.json(resp);


    var urls = ["https://app-15086.on-aptible.com/api/channels/47755bd5-d542-4256-80fb-63b92b4d93b6/messages/?includeContent=true&offset=0&limit=20",
        "https://app-15086.on-aptible.com/api/channels/d2171a62-702b-4262-b026-eded81cc0719/messages/?includeContent=true&offset=0&limit=20"
    ];
    var responses = [];
    var completed_requests = 0;

    urls.forEach(uri => {

        request.get({
            url: uri,
            headers: {
                responseType: 'application/xml',
                Accept: 'application/xml',
                'Access-Control-Allow-Origin': '*',
                Authorization: 'Basic ' + 'YWRtaW46RWthcmUxMjNA'

            }
        }, (error, response, body) => {
            if (error) {
                return console.dir(error);
            }

            parseString(body, function(e, r) {

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
                        if (connectorName.toString() === "Processing") {

                            let sent = element.connectorMessage[0].sent[0].content[0];
                            sent_nack_count += ((sent.match(/AE/g) || []).length);
                            sent_ack_count += ((sent.match(/AA/g) || []).length);
                            let response = element.connectorMessage[0].response[0].content[0];
                            received_nack_count += ((response.match(/AE/g) || []).length);
                            received_ack_count += ((response.match(/AA/g) || []).length);
                        }

                    });
                    //console.log("ack: "+ack_count+" "+"nack: " + nack_count );

                    var systemObj = new system('Exeter',
                        new messages(received_ack_count, received_nack_count),
                        new messages(sent_ack_count, sent_nack_count));

                    //console.log(systemObj);
                    responses.push(systemObj);
                    completed_requests++;
                    if (completed_requests === urls.length) {
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

});


module.exports = router;