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
app.use(express.static(path.resolve(__dirname, 'public')));

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
app.use(express.urlencoded({ extended: false }));

// have the app find out if the current user is signed in fixme
app.use((req, res, next) => {
    res.locals.maxRSVP = req.session.maxRSVP;
    next();
});

// ~~~~~~~~~~~~~   ROUTES   ~~~~~~~~~~~~~~

app.get('/', (req, res) => {        
    // if the rsvp code has NOT been added
    if (!req.session || !req.session.rsvp_code) {
        // render the main view to get the rsvp code
        res.render('index');
    }
    else if (req.session.rsvp_code) {
        submittedRSVP.findOne({code:req.session.rsvp_code}, (err, doc) => {
            res.redirect('/edit');
        });
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
        submittedRSVP.findOne({ code: code }, (err, doc) => {
            if (doc) {
                console.log(`code has been submitted already`);
                
                req.session.rsvp_code = code;
                res.cookie('rsvp_code', code, {'expires': new Date(Date.now() + 900000)});

                res.redirect('/edit');
            } else {
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

            const sub = new submittedRSVP({
                rsvpCode: mongoose.Types.ObjectId(doc._id),
                numberAttending: 0,
                submittedAt: Date.now()
            });
            sub.save(function(err) {
                if (err) {                    
                    res.redirect('/error');
                }
                else {    
                    res.redirect('/submission');
                }
            });

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
        res.render('submission', { attending: req.session.rsvp_going, edited: req.session.edited });
    }
    else {
        res.redirect('/');
    }
});

// error route
app.get('/error', (req, res) => {
    res.render('error');
});

// ~~~~~~~~~~~~~   EDIT ROUTES   ~~~~~~~~~~~~~~

// fixme change the routes to not include the code in the path

app.get('/edit', (req, res) => {
    if (req.session.rsvp_code) {        
        res.redirect(`/edit/${req.session.rsvp_code}`);
    } else {
        res.redirect('/');
    }
});

app.get('/edit/:code', (req, res) => {
    
    let maxrsvp = 0;

    rsvpCodes.findOne({code:req.params.code}, (err, doc) => {
        if (!err) {
            maxrsvp = doc.maxRSVP;

            submittedRSVP.findOne({rsvpCode:doc._id}, (err, doc) => {
                if (!err) {                    
                    res.render('edit', {rsvp_code: req.params.code, rsvp_going: doc.numberAttending > 0 ? true : false, maxRSVP: maxrsvp});    

                } else {
                    res.redirect('/');
                }
            });        
        } else {
            res.redirect('/');
        }
    });
});

app.post('/edit/:code', (req, res) => {
    // feat/: handle editing a previously submitted rsvp

    const {rsvp_going, rsvp_num} = req.body;
    rsvpCodes.findOne({code:req.params.code}, (err, doc) => {
        if (!err) {
            submittedRSVP.findOneAndUpdate({code:doc._id}, {numberAttending: rsvp_going === "Yes" ? rsvp_num : 0, editedAt: new Date.now()}, (err, doc) => {
                if (!err) {
                    req.session.edited = true;
                    res.redirect('/submission');
                } else {
                // if there's an error saving the edited rsvp
                    res.redirect('/error');
                }
            })
        }
    });
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
