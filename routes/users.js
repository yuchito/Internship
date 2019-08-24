var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../auth/authenticate');

router.use(bodyParser.json());

router.route('/signup')
    .post((req, res, next) => {
        User.register(new User({ email: req.body.username }),
            req.body.password, (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err + ' 1' });
                } else {
                    if (req.body.name) {
                        user.name = req.body.name;
                    }
                    User.create(user)
                        .then((user) => {
                            //passport.authenticate('local')(req, res, () => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({ success: true, status: 'Registration Successful!' });
                        })
                        .catch(err => {
                            if (err) {
                                res.statusCode = 500;
                                res.setHeader('Content-type', 'application/json');
                                res.json({ err: err + ' niveau 2' });
                                return;
                            }
                        });
                    //});
                }
            });
    });

/* GET users listing. */
router.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        User.findAll()
            .then((users) => {
                if (users) {
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(users);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

router.route('/login')
    .post(passport.authenticate('local'), (req, res) => {
        console.log('login proccessing : ');
        var token = authenticate.getToken({ id: req.user.id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        user = {
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            token: token
        }
        res.json({
            status: 'You are successfully logged in!',
            success: true,
            user: user
        });
    }, err => {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            status: 'Your credentials are not correct',
            success: false,
            user: null
        });
    });

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});

module.exports = router;