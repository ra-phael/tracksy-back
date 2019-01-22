const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
    security: {
        question: {
            type: String,
            required: true,
            minlength: 4,
        },
        password: {
            type: String,
            required: true,
            minlength: 1
        },
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
    let user = this;
    const userObject = user.toObject();
    
    return _.pick(userObject, ['_id', 'email', 'security.question'])
};

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    const access = 'auth';
    let token = jwt.sign({
            _id: user._id.toHexString(),
            access
        },
        process.env.JWT_SECRET
        ).toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('security.password')) {
        
        let pwd = user.security.password.toLowerCase();

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(pwd, salt, (err, hash) => {
                user.security.password = hash;
                next();
            });
        })
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };