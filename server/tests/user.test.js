const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { User } = require('./../models/user');
const { users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);

expect.extend({
    toContainObject(received, argument) {
  
      const pass = this.equals(received, 
        expect.arrayContaining([
          expect.objectContaining(argument)
        ])
      )
  
      if (pass) {
        return {
          message: () => (`expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`),
          pass: true
        }
      } else {
        return {
          message: () => (`expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`),
          pass: false
        }
      }
    }
  })

describe('Update Watched Items', () => {
    it('should add an item not already watched', (done) => {
        let newItem = { _id: new ObjectID().toString()}

        User.findById(users[0]._id).then(user => {
            user.updateWatchedItems(newItem).then(user => {
                expect(user.watchedItems.length)
                .toBe(3);
                done();

            }).catch(e => done(e))
        }).catch(e => done(e))

    });

    it('should remove an item already watched', (done) => {
        let item = { _id: ObjectID(users[0].watchedItems[0]._id).toString()}

        User.findById(users[0]._id).then(user => {
            user.updateWatchedItems(item).then(user => {
                expect(user.watchedItems)
                .not
                .toContainObject(item);
                done();

            }).catch(e => done(e))
        }).catch(e => done(e))

    })
})

describe('Find by credentials', () => {
    it('should find a user by credentials', (done) => {
        let email = users[1].email
        let answer = users[1].security.answer

        User.findByCredentials(email, answer).then(user => {
            expect(user._id).toEqual(users[1]._id)
            done()
        }).catch(e => done(e))
    });

    it('should return an error if email is unknown', (done) => {
        let email = 'raphael@roullet.com'
        let answer = 'answer'

        User.findByCredentials(email, answer).catch(e => {
            expect(e).toBe('User not found')
            done();
          })
    });

    it('should return an error if answer is incorrect', (done) => {
        let email = users[0].email
        let answer = 'notherightanswer'

        User.findByCredentials(email, answer).catch(e => {
            expect(e).toBe('Wrong answer')
            done();
          })
    });

})