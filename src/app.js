const express = require('express');
const mongoose = require('mongoose');

require('./db');

// db objects here TODO

const session = require('express-session');
const path = require('path');
// would we need an auth file
// const auth = require('./auth.js');

const app = express();

// change views directory
app.set('views', path.join(__dirname, 'views'));

// set the view engine to handlebars
app.set('view engine', 'hbs');

// serving the app from the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
// app.use(session({
//     secret: 'add session secret here!',
//     resave: false,
//     saveUninitialized: true,
// }));

// app.use((req, res, next) => {
//     res.locals.user = req.session.user;
//     next();
// });

// TODO all the routes
app.get('/', (req, res) => {

});

app.listen(process.env.PORT || 8000);
