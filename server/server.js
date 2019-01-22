require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const _ = require('lodash');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res)  => res.send('Hello World!'));


// ###### USERS ######

// POST /users
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'security.question', 'security.password']);
    let user = new User(body);
    
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


app.listen(process.env.PORT, () => {
    console.log('Server started');
});

module.exports = { app };