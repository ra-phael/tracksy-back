require('./config/config')
const { dailyFetch, dailyDispatch } = require('./cron/cron')

const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const cors = require('cors')
const { mongoose } = require('./db/mongoose')
const ObjectId = mongoose.Types.ObjectId

const { User } = require('./models/user')
const { Item } = require('./models/item')
const corsWhitelist = ['http://localhost:3000', 'localhost:8080', '127.0.0.1:49987', 'https://tracksy.netlify.com']
const { authenticate } = require('./middleware/authenticate')

const app = express()

// Sentry config
const Sentry = require('@sentry/node')
Sentry.init({ dsn: 'https://a2483fca12694608bab21826a88d5f5e@sentry.io/1411066' })
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())

// Start the CRON Jobs
dailyFetch.start()
dailyDispatch.start()

const corsOptions = {
  origin: function (origin, callback) {
    if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  allowedHeaders: 'Content-Type,x-auth',
  exposedHeaders: 'x-auth'
}

app.use(cors(corsOptions))

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('OK')
})

// ###### USERS ######

// ADD a user
app.post('/users', (req, res) => {
  // Filtering props in request
  let body = _.pick(req.body, ['email', 'security.question', 'security.answer'])
  let user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(user)
  }).catch((e) => {
    if (e.code === 11000) {
      res.status(400).send({ code: 11000, message: 'User email already exists' })
    } else {
      res.status(400).send(e)
    }
  })
})

// LOGIN
app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'security.answer'])

  User.findByCredentials(body.email, body.security.answer)
    .then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user)
      })
    }).catch((e) => {
      res.status(400).send({ code: 4000, message: 'Wrong user/answer combination' })
    })
})

// LOG OUT
app.delete('/users/me/token', authenticate, (req, res) => {
  console.log('removing token', req.token)
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
})

// GET Question
app.get('/users/question', (req, res) => {
  User.findOne({ email: req.query.email })
    .then((user) => {
      if (!user) {
        res.status(404).send({ code: 4004, message: 'Email address is not registered in DB' })
      }
      res.send({
        question: user.security.question
      })
    }).catch(e => {
      res.status(400).send(e)
    })
})

// Update WatchedItems
app.patch('/users/watcheditems', authenticate, (req, res) => {
  let body = _.pick(req.body, ['item'])

  if (!ObjectId.isValid(body.item._id)) {
    res.status(400).send('Invalid id')
    return
  }

  req.user.updateWatchedItems(body.item).then((user) => {
    console.log('user after update', user)
    res.status(200).send(user)
  }, () => {
    res.status(400).send('An error occured while trying to update watched items')
  })
})

// ###### ITEMS ######

// GET /items
app.get('/items', (req, res) => {
  Item.find().then(items => {
    res.send(items)
  }).catch(e => {
    res.status(400).send(e)
  })
})

app.listen(process.env.PORT, () => {
  console.log('Server started on port', process.env.PORT)
})

module.exports = { app }
