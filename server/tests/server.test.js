const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { User } = require('./../models/user');
const { users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);


describe('GET /', () => {
    it('should connect to server', () => {
        request(app)
        .get('/')
        .expect(200)
        .expect((res) => {
            expect(res.body).toBe('Hello World!')
        })
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'user3@blabla.com'
        const question = "What's your favorite movie?"
        const password = "Clockwork Orange"

        request(app)
            .post('/users')
            .send({
                email,
                security: {question, password}
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.security.password).not.toBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

})