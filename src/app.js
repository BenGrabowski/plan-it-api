require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const eventsRouter = require('./events/events-router');

const app = express();

const morganOption = (NODE_ENV === 'production') 
? 'tiny'
: 'common';

app.use(morgan(morganOption));
app.use(helmet());
// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

var whitelist = 'https://plan-it.now.sh';
var corsOptions = {
 origin: function (origin, callback) {
   if (whitelist.indexOf(origin) !== -1) {
     callback(null, true)
   } else {
     callback(new Error('Not allowed by CORS'))
   }

app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: {message: 'server error'} }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
});

module.exports = app;