var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

const config = require('../auth/key');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('authenitcation prosessing ...');
        User.findOne({ email: username }, function(err, user) {
            if (err) { console.log('errr'); return done(err); }
            if (!user) { cosnole.log('non userr'); return done(null, false); }
            if (!(user.password === password)) { console.log('okkk'); return done(null, false); }
            console.log('eeeeeeeeeeeeee');
            return done(null, user);
        });
    }
));*/

exports.getToken = function(user) {
    return jwt.sign(user, config.key, { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.key;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_paload, done) => {
        console.log("JWT payload", jwt_paload);
        User.findOne({ where: { id: jwt_paload.id } })
            .then(user => {
                return done(null, user);
            }, err => {
                console.log(err);
                return done(null, err);
            });
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        var err = new Error("You are not authorized to perform this operation only for admin user!");
        err.ststus = 403;
        next(err);
    }
};