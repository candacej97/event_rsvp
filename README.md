# event_rsvp
Web app boilerplate for creating an rsvp site for an event.

<!-- ## Features -->

<!-- * admin panel - create (or add custom) rsvp codes to db -->
<!-- * ability to use a config file for db security -->

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* Node
* NPM
* MongoDB

### Installing

```
git clone https://github.com/candacej97/event_rsvp.git
cd event_rsvp
npm install
npm start
```

## Testing

go to your browser and go to `localhost:8000`

## Deployment

Follow the deployment instructions of your host.

## Built With

* NodeJS
    * express
    * mongoose
    * hbs
    * express-session
    * express-handlebars
    * path
* MongoDB

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgements

* [This handlebars helper function](https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js) helped me create a the form of how many total rsvp's to count.
* [This code](https://stackoverflow.com/questions/41423727/handlebars-registerhelper-serverside-with-expressjs) helped me register the handlebars helper function from above for it to work.