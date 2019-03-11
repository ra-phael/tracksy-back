const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
var ObjectId = mongoose.Schema.Types.ObjectId

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  watchedItems: [{
    _id: {
      type: ObjectId
    },
    priceThreshold: {
      price: {
        type: Number
      },
      currency: {
        type: String
      }
    }
  }],
  security: {
    question: {
      type: String,
      required: true,
      minlength: 4
    },
    answer: {
      type: String,
      required: true,
      minlength: 1
    }
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// Override mongoose method responsible for converting model to json
UserSchema.methods.toJSON = function () {
  let user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email', 'watchedItems', 'security.question'])
}

UserSchema.methods.updateWatchedItems = function (item) {
  let user = this
  // let itemIndex = _.find(user.watchedItems, el => el._id === item._id)
  let itemArray = user.get('watchedItems').filter(el => el._id.equals(item._id))

  if (typeof itemArray !== 'undefined' && itemArray.length > 0) {
    console.log('Removing already watched item', item)
    return User.findByIdAndUpdate({
      _id: user._id
    }, {
      $pull: {
        watchedItems: { _id: item._id }
      }
    },
    { new: true })
      .then(user => user)
  } else {
    console.log('Adding watched item', item)
    return User.findByIdAndUpdate({
      _id: user._id
    }, {
      $addToSet: {
        watchedItems: { _id: item._id }
      }
    },
    { new: true })
      .then(user => user)
  }
}

UserSchema.methods.generateAuthToken = function () {
  let user = this
  const access = 'auth'
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access
  },
  process.env.JWT_SECRET
  ).toString()

  user.tokens = user.tokens.concat([{ access, token }])

  return user.save().then(() => {
    return token
  })
}

UserSchema.methods.removeToken = function (token) {
  let user = this

  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject(e)
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredentials = function (email, answer) {
  answer = answer.toLowerCase()

  return User.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('User not found'))
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(answer, user.security.answer, (error, result) => {
          if (result === true) {
            resolve(user)
          } else {
            reject(new Error('Wrong answer'))
          }
        })
      })
    })
}

UserSchema.pre('save', function (next) {
  let user = this

  if (user.isModified('security.answer')) {
    let pwd = user.security.answer.toLowerCase()

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(pwd, salt, (err, hash) => {
        user.security.answer = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = { User }
