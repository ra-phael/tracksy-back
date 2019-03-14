// const path = require('path');
// var DOMAIN = 'YOUR_DOMAIN_NAME';
var API_KEY = process.env.MAILGUN_KEY
var domain = 'sandbox9b1996eccc1748068b7aff18f24b88b1.mailgun.org'
var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: domain })
const { emailTemplate } = require('./emailTemplate')

/**
 * Build the config parameters to send the email with listings
 * @param {string} emailAdress
 * @param {string} body
 */
const makeEmail = (emailAdress, body) => ({
  from: 'Tracksy <tracksy@delightful.tech>',
  to: emailAdress,
  subject: 'We found new listings',
  html: body
})

/**
 * Use mailgun to send an email
 * @param {string} recipientAddress - Email address
 * @param {string} body - Email body
 */
const sendEmail = (recipientAddress, body) => {
  mailgun.messages().send(makeEmail(recipientAddress, body), (error, body) => {
    if (error) {
      console.error('Error while sending email:', error)
    }
  })
}

/**
 * Send email with new listing to a specific user
 * @param {Object} user
 * @param {Array} listings
 */
const sendListings = (user, listings) => {
  let template = emailTemplate(listings)
  sendEmail(user.email, template)
}

module.exports = { sendListings }
