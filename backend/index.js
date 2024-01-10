import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import session from 'express-session';
import google from 'googleapis';

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
    cb(null, {
        accessToken,
        refreshToken,
        profile
    });
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'calendar'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    console.log('req.user', req.user);
    const calendar = google.calendar({
        version: 'v3',
        auth: new google.Auth.auth(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          req.user.accessToken
        )
      });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        const events = response.data.items;
        if (events.length) {
          console.log('Upcoming 10 events:');
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
          });
        } else {
          console.log('No upcoming events found.');
        }
      });
    res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
    res.send('Google login failed');
});

app.get('/dashboard', (req, res) => {
    res.send('Dashboard');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});