const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { User } = require('./../models/user');
const { users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);


describe('GET /', () => {
    it('should connect to server', () => {
        request(app)
        .get('/')
        .then((res) => {
            expect(res.status == 200);
        })
    })
})

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'user3@blabla.com'
        const question = "What's your favorite movie?"
        const answer = "Clockwork Orange"

        request(app)
            .post('/users')
            .send({
                email,
                security: {question, answer}
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
                    expect(user.security.answer).not.toBe(answer);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request is invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'email@sth.com',
                security: {question: ' ', answer: 'answer'}
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email already used', (done) => {
        request(app)
        .post('/users')
        .send({
            email: users[0].email,
            password: 'whatever'
        })
        .expect(400)
        .end(done);
    });

})

describe('POST /users/login', () => {
    it('should login user and return token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                security:{
                    answer: users[1].security.answer
                } 
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                security:{
                    answer: 'WhatEveR'
                } 
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                };

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });

})


describe('PATCH /users/watcheditems', () => {
    it('should return a validation error with invalid IDs', (done) => {
        request(app)
            .patch('/users/watcheditems')
            .set('x-auth', users[0].tokens[0].token)
            .send({
                item: { _id: "a" }
            })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.watchedItems.length).toBe(2);

                    done();
                }).catch((e) => done(e));
            })
    });

})





