var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var app = express();
require('dotenv').config()
var cors = require('cors')

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth0
var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://esgi-5ibc.eu.auth0.com/.well-known/jwks.json'
    }),
    audience: '5ibc-esgi',
    issuer: 'https://esgi-5ibc.eu.auth0.com/',
    algorithms: ['RS256']
});

app.use(jwtCheck);

const userRoutes = require('./routes/userRoutes');
userRoutes(app);

const port = 3005;
app.listen(port);

module.exports = app;
