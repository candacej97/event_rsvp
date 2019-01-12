const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
require('./db');

const app = express();
// would we need an auth file? todo
// const auth = require('./auth.js');

// enable information
app.use(session({
    secret: 'secret for signing session id', 
	saveUninitialized: false, 
    resave: false,
    cookie: { expires: false }
}));

// include mongo models
const rsvpCodes = mongoose.model('rsvpCodes');
const submittedRSVP = mongoose.model('submittedRSVP');

// serve static files
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// change views directory
app.set('views', path.join(__dirname, 'views'));

// set template engine
app.engine("hbs", exphbs({
    defaultLayout: "layout",
    extname: ".hbs",
    helpers: require("./helper").helpers, // same file that gets used on our client
    partialsDir: "src/views/partials/", // default is views/partials but because we are serving the app from the src/public dir we have to include it
    layoutsDir: "src/views/layouts/" 
  }));

// set the view engine to handlebars
app.set("view engine", "hbs");

// serving the app from the public dir
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// have the app find out if the current user is signed in fixme
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

                // set cookies
                res.cookie('rsvp_code', code, {'expires': new Date(Date.now() + 900000)});
                res.cookie('maxRSVP', doc.maxRSVP, {'expires': new Date(Date.now() + 900000)});

                res.redirect('/');
            }
            else {
                const error = err ? true : false;
                res.render('index', { error: error });
            }
        });
    }
    else if (!req.session.rsvp_going) {
        // set session + cookies
        const {rsvp_going} = req.body;
        req.session.rsvp_going = rsvp_going === "Yes" ? true : false;
        res.cookie('rsvp_going', rsvp_going === "Yes" ? true : false, {'expires': new Date(Date.now() + 900000)});

        if (req.session.rsvp_going) {
            res.redirect('/');
        }
        else {
            req.session.submitted = true;
            res.cookie('submitted', true, {'expires': new Date(Date.now() + 900000)});

            res.redirect('/submission');
        }
    }
    else if (!req.session.rsvp_num) {
        // set session + cookies
        const {rsvp_num} = req.body;
        req.session.rsvp_num = rsvp_num;
        res.cookie('rsvp_num', rsvp_num, {'expires': new Date(Date.now() + 900000)});

        // add new doc to db's submitted collection + use session data
        rsvpCodes.findOne({ code: req.session.rsvp_code }, function(err, doc){

            const sub = new submittedRSVP({
                rsvpCode: mongoose.Types.ObjectId(doc._id),
                numberAttending: req.session.rsvp_num,
                submittedAt: Date.now()
            });
            sub.save(function(err) {
                if (err) {
                    console.log(`error on saving new submittedRSVP => ${err}`);
                    
                    res.redirect('/error');
                }
                else {
                    req.session.submitted = true;
                    res.cookie('submitted', true, {'expires': new Date(Date.now() + 900000)});
    
                    res.redirect('/submission');
                }
            });
    
        });

    }
    else {
        res.redirect('/submission');
    }
});

// successful submission
app.get('/submission', (req, res) => {

    if (req.session.submitted) {
        res.render('submission', { attending: req.session.rsvp_going, redirectedFromRoot: false });
    }
    else {
        res.redirect('/');
    }
});

// error route
app.get('/error', (req, res) => {
    res.render('error');
});


// edit routes that will allow users to edit responses
app.get('/edit', (req, res) => {
    // todo
    
    // use existing cookies

    // feat: no need to put in rsvp code again
    // ... AND set all values to req.session values to show that they already answered

    // res.render('rsvp');
});

app.post('/edit', (req, res) => {
    
});

// ~~~~~~~~~~~~~   ADMIN ROUTES   ~~~~~~~~~~~~~~

// add an admin user through your mongoDB instance before deployment

// these routes are not meant to implement signing up a new admin, otherwise everyone could be an admin 

app.get('/admin', (req, res) => {
    /**
     * todo
     * 
     * show a list of the invitations
     * show a key of (black - invited, green - rsvp yes, red - rsvp no)
     * show a button that links to editing invite list
     * feat: download a pdf (or excel) version of the data
     * 
     */
});

app.get('/admin/edit', (req, res) => {
    /**
     * todo
     * 
     * add list of invitations (namesOnInvite, maxRSVP, code)
     * show a link to randomly generate an invitation code to each person
     * feat: delete (or archive) multiple or single amount of invitations
     */
});

app.post('/admin/edit', (req, res) => {});

app.listen(process.env.PORT || 8000);
