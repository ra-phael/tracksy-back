const cron = require('cron')
const { pingCall, fetchNewListings } = require('./racleur')
const { ScrapedListing } = require('../models/scrapedListing')
const { processNewListings, prepareDailyDeals } = require('./consolidator')

// Triggers new scraping
const dailyFetch = new cron.CronJob('0 30 11 * * *', () => {
  console.log('## Running daily fetch job ###')

  pingCall()
    .then(statusCode => {
      if (statusCode === 200) {
        fetchNewListings()
          .then(data => processNewListings(data))
          .catch(error => console.log('Error running CRON', error))
      }
    })
})

const emailTrigger = () => {
  // Get the latest scrape
  return new Promise((resolve, reject) => {
    ScrapedListing.findOne().sort({ '_id': -1 })
      .exec(function (err, doc) {
        // console.log('Latest scrape:', doc)
        if (err) reject(err)
        if (doc.timeStamp.slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
          console.log('Last scraped listing is older than today')
          reject(new Error('Last scraped listing is older than today'))
        } else {
          prepareDailyDeals(doc)
          resolve()
        }
      })
  })
}

// Triggers email preparation and sending
const dailyDispatch = new cron.CronJob('0 45 11 * * *', () => {
  console.log('## Running daily dispatch job ###')
  try {
    emailTrigger()
  } catch (e) {
    console.error(e)
  }
})

module.exports = { dailyFetch, dailyDispatch }
