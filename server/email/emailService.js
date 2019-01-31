const path = require('path');
// var DOMAIN = 'YOUR_DOMAIN_NAME';
var api_key = process.env.MAILGUN_KEY;
var domain = "sandbox9b1996eccc1748068b7aff18f24b88b1.mailgun.org"
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
const { emailTemplate } = require('./emailTemplate')

const makeEmail = (body) => ({
  from: 'Tracksy <tracksy@delightful.tech>',
  to: 'raroullet@gmail.com',
  subject: 'We found new listings',
  html: body,
});

const testSend = (body) => {
    mailgun.messages().send(makeEmail(body), (error, body) => {
      console.log('Email sent:', body);
      if (error) {
        console.log('Error while sending email:', error);
      }
    });
}

const sendListings = (user, listings) => {
  // console.log(user);
  let template = emailTemplate(listings)
  // console.log(template);
  testSend(template);
}

module.exports = { testSend, sendListings };