var express = require('express');
var router = express.Router();
const Channel = require('../models/channel');
const db = require('../config/database');

router.get('/', (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    Channel.findAll()
        .then((docs) => {
            res.json({
                message: 'Fetching data successfuly',
                channels: docs
            });
        }, (err) => next(err))
        .catch((err) => next(err));
});

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
            console.log("eroor adding new Channel");
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

router.get('/:id', (req, res, next) => {
    Channel.findById(req.params.id)
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ messgae: 'Channel not found!' });
            }
        });
});

module.exports = router;