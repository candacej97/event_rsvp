const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
require('./db');

const app = express();
// would we need an auth file
// const auth = require('./auth.js');

// Create an instance of the express-handlebars
const handlebars  = require('./helper.js')(exphbs);

// set template engine
app.engine('hbs', handlebars.engine);

// enable information
app.use(session({
    secret: 'secret for signing session id', 
	saveUninitialized: false, 
    resave: false,
    cookie: { expires: false }
}));

const rsvpCodes = mongoose.model('rsvpCodes');
const submittedRSVP = mongoose.model('submittedRSVP');

// serve static files
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// change views directory
app.set('views', path.join(__dirname, 'views'));

// set the view engine to handlebars
app.set('view engine', 'hbs');

// serving the app from the public folder
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// have the app find out if the current user is signed in
app.use((req, res, next) => {
    res.locals.maxRSVP = req.session.maxRSVP;
    next();
});

// ~~~~~~~~~~~~~   ROUTES   ~~~~~~~~~~~~~~

/**
 * session should be this by the end of the 'loop'
 *  rsvp code
 *  rsvpgoing
 *  rsvpnumber
 */
app.get('/', (req, res) => {    
    // if the rsvp code has NOT been added
    if (!req.session || !req.session.rsvp_code) {
        // render the main view to get the rsvp code
        res.render('index');
    }
    // if the user has not answered yes or no
    else if (!req.session.rsvp_going) {
        // render the rsvp view
        res.render('rsvp');
    }
    // if the number of rsvps has not been set
    else if (!req.session.rsvp_num) {
        // render the count view
        res.render('count');
    }
    // if the rsvp has been completed and they are redirected to this route
    else {
        // redirect to submission sending request to resubmit
        res.redirect('/submission');

        // we can have an edit route that will allow users to edit responses

        // ... AND set all values to req.session values to show that they already answered
        // note cookies vs cache and how to implement state regardless of redirect
    }
});

app.post('/', (req, res) => {
    if (!req.session.rsvp_code) {
        const {code} = req.body;
        rsvpCodes.findOne({ code: code }, (err, doc) => {
            // if the doc is found redirect
            if (doc) {
                console.log(doc);
                req.session.rsvp_code = code;
                req.session.maxRSVP = doc.maxRSVP;
                res.redirect('/');
            }
            else {
                console.log(req.session);
                const error = err ? true : false;
                res.render('index', { error: error });
            }
        });
    }
    else if (!req.session.rsvp_going) {
        // set session
        const {rsvp_going} = req.body;
        req.session.rsvp_going = rsvp_going === "Yes" ? true : false;
        if (req.session.rsvp_going) {
            res.redirect('/');
        }
        else {
            req.session.submitted = true;
            res.redirect('/submission');
        }
    }
    else if (!req.session.rsvp_num) {
        // set session
        const {rsvp_num} = req.body;
        req.session.rsvp_num = rsvp_num;
        // add new doc to db's submitted collection
        const sub = new submittedRSVP({
            code: req.session.rsvp_code,
            numberAttending: req.session.rsvp_num,
            submittedAt: Date.now(),
        });
        sub.save((err, doc) => {
            if (err) {
                res.redirect('/error');
            }
            else {
                req.session.submitted = true;
                res.redirect('/submission');
            }
        });
    }
    else {
        res.redirect('/submission');
    }
});

// successful submission
app.get('/submission', (req, res) => {
    console.log(req.session);

    if (req.session.submitted) {
        res.render('submission', { attending: req.session.rsvp_going, redirectedFromRoot: req.session.submitted });
    }
    else {
        res.redirect('/');
    }
});

// error route
app.get('/error', (req, res) => {
    res.send(404, `<p>Lost at sea are we?</p><p>⚓️</p>`);
});

// edit routes
app.get('/edit', (req, res) => {
    // no need to put in rsvp code again
    // res.render('rsvp');
});

app.post('/edit', (req, res) => {
    
});

// ~~~~~~~~~~~~~   ADMIN ROUTES   ~~~~~~~~~~~~~~

app.get('/admlogin', (req, res) => {});

app.post('/admlogin', (req, res) => {});

app.get('/admin', (req, res) => {});

app.get('/admin/add', (req, res) => {});

app.post('/admin/add', (req, res) => {});

app.get('/admin/edit', (req, res) => {});

app.post('/admin/edit', (req, res) => {});

app.listen(process.env.PORT || 8000);
