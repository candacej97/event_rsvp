# event_rsvp
Web app "boilerplate" for creating an rsvp site for an event.

## Features

* admin panel - create (or add custom) rsvp codes to db
* ability to use a config file for db security

## Built With

* NodeJS
    * express
    * mongoose
    * hbs
    * express-session
    * express-handlebars
    * path
* MongoDB

## Run Instructions

```
git clone https://github.com/candacej97/event_rsvp.git
cd event_rsvp
npm install
npm start
```

### Testing

go to your browser and go to `localhost:8000`

## Deployment

Follow the deployment instructions of your host.

## Acknowledgements

[This handlebars helper function](https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js) helped me create a the form of how many total rsvp's to count.