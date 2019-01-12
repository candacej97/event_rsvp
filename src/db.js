const mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

// admin users schema
const adminUsers = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}, { strict: false });

mongoose.model('adminUsers', adminUsers);

// rsvp codes schema
const rsvpCodes = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    maxRSVP: { type: Number, required: true },
    namesOnInvite: [{ type: String }]
}, { strict: false });

mongoose.model('rsvpCodes', rsvpCodes);

// submitted rsvp schema
const submittedRSVP = new mongoose.Schema({
    rsvpCode: {type: ObjectId, ref: 'rsvpCodes', required: true},
    numberAttending: { type: Number, required: true },
    submittedAt: { type: Date, required: true },
    editedAt: Date
}, { strict: false });

mongoose.model('submittedRSVP', submittedRSVP, 'submittedRSVP', false);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
    // if we're in PRODUCTION mode, then read the configration from a file
    // use blocking file io to do this...
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, 'config.json');
    const data = fs.readFileSync(fn);

    // our configuration file will be in json, so parse it and set the
    // conenction string appropriately!
    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} else {
    // if we're not in PRODUCTION mode, then use
    dbconf = 'mongodb://localhost/event_rsvp';
}

mongoose.connect(dbconf, { useNewUrlParser: true, useCreateIndex: true });