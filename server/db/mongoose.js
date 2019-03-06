const mongoose = require('mongoose')

const options = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000,
  useMongoClient: true
}

mongoose.Promise = global.Promise // set up mongoose to use promises
mongoose.connect(process.env.MONGODB_URI, options)

module.exports = { mongoose }
