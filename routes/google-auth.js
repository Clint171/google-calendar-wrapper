import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import session from 'express-session';
import axios from 'axios';
import db from "../lib/db/db.js"

dotenv.config();

const router = express.Router();

router.use(passport.initialize());

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
    }, (accessToken, refreshToken, profile, cb) => {
    // eslint-disable-next-line no-underscore-dangle
    cb(null, {
        accessToken,
        refreshToken,
        profile
    });
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
}
);

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
}
);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    
    axios.get(`https://www.googleapis.com/calendar/v3/calendars/${req.user.profile._json.email}/events`, {
        headers: {
            Authorization: `Bearer ${req.user.accessToken}`
        }
    }).then((response) => {
        console.log('response', response.data);
        res.redirect("/events");
    }).catch((error) => {
        console.log('error', error);
        res.render("index", { title: 'Clints-planner : Welcome', message: 'An error occurred! Please try again.' });
    })
});

export default router;