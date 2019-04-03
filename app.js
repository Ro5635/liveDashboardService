const express = require('express');
const path = require('path');
const morganLogger = require('morgan');
const bodyParser = require('body-parser');

const logger = require('./Helpers/LogHelper').getLogger(__filename);
const responseMiddleware =  require('./Middleware/responseMiddleware');

// Setup Routers
const index = require('./Routers/index');

const app = express();

// Check for env environment variable
if (!process.env.NODE_ENV) {
    logger.error('Environment env variable not set');
    logger.error('NODE_ENV is required, Aborting');
    process.exit(1);
}


// Middleware
app.use(morganLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(responseMiddleware.addSendResponseToRes);

app.use(function (req, res, next) {
    "use strict";
    res.setHeader('x-powered-by', 'Pepsi Max');
    res.setHeader('content-type', 'application/json');
    // TODO: Create list of allowed origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Routers
app.use('/', index);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    logger.error('Hit final error handler');

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.status(404).send({Error: 'Endpoint not found'});
});

module.exports = app;