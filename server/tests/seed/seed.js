const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'l@example.com',
    security: {
        question: 'Name of first pet?',
        answer: 'Wilfred',
    },
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }],
    watchedItems : [ 
        {
            "_id" : ObjectID("5c4f39afdb2a213a78692e94")
        }, 
        {
            "_id" : ObjectID("5c4f39afdb2a213a78692e95")
        }
    ]
}, {
    _id: userTwoId,
    email: 'jen@example.com',
    security: {
        question: 'Name of first school?',
        answer: 'LSE',
    },
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}]


const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = { users, populateUsers };