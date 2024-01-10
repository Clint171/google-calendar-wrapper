import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();

const app = express();

app.use(passport.initialize());
// app.use(passport.session());
app.use(session({
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
    cb(null, profile._json);
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    console.log(req.user);
    res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
    res.send('Google login failed');
});

app.get('/dashboard', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});