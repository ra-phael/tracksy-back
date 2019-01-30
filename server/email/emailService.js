const path = require('path');
// var DOMAIN = 'YOUR_DOMAIN_NAME';
var api_key = process.env.MAILGUN_KEY;
var domain = "sandbox9b1996eccc1748068b7aff18f24b88b1.mailgun.org"
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
const { emailTemplate } = require('./emailTemplate')

var data = {
  from: 'Tracksy <tracksy@delightful.tech>',
  to: 'raroullet@gmail.com',
  subject: 'Welcome from Tracksy',
  text: 'Testing some Mailgun awesomness!',
  html: "<html><h1>HTML version of the body</h1></html>",
};

const testSend = () => {
    mailgun.messages().send(data, (error, body) => {
      console.log('Email sent:', body);
      console.log('Error while sending email:', error);
    });
}

const sendListings = (user, listings) => {
  // console.log(user);
  console.log(emailTemplate(listings));
}

module.exports = { testSend, sendListings };