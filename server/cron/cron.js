require('../config/config')
const cron = require('cron')
const { pingCall, fetchNewListings } = require('./racleur')
const { ScrapedListing } = require('../models/scrapedListing')
const { processNewListings, prepareDailyDeals } = require('./consolidator')

/**
 * Try to get a 200 by calling the function passed as param
 * n times before giving up
 * @param {Function} fn - A function call to an API
 * @param {number} n - The number of times to try before giving up
 * @return {number} status code
 */
const fetchRetry = async (fn, n) => {
  for (let i = 0; i < n; i++) {
    try {
      let code = await fn()
      if (code === 200) {
        return code
      }
    } catch (err) {
      const isLastAttempt = i + 1 === n
      if (isLastAttempt) throw err
    }
  }
}

/**
 * Ping the scraper server (via fetchRetry) to wake it up
 * and trigger the fetching of new listings
 */
const scrapeTrigger = async () => {
  try {
    const code = await fetchRetry(pingCall, 5)
    if (code === 200) {
      fetchNewListings()
        .then(data => processNewListings(data))
    }
  } catch (err) {
    console.error('Error waking scraper:', err)
  }
}

/**
 * CRON job that triggers new scraping
 */
const dailyFetch = new cron.CronJob('0 30 11 * * *', () => {
  console.info('## Running daily fetch job ###')
  scrapeTrigger()
})

/**
 * Get the last scrape and call prepareDailyDeals to send emails
 * @return {Promise}
 */
const emailTrigger = () => {
  // Get the latest scrape
  return new Promise((resolve, reject) => {
    ScrapedListing.findOne().sort({ '_id': -1 })
      .exec(function (err, doc) {
        // console.log('Latest scrape:', doc)
        if (err) reject(err)
        if (doc.timeStamp.slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
          reject(new Error('Last scraped listing is older than today'))
        } else {
          prepareDailyDeals(doc)
          resolve()
        }
      })
  })
}

/**
 * CRON Job that triggers email preparation and sending
 */
const dailyDispatch = new cron.CronJob('0 45 11 * * *', () => {
  console.info('## Running daily dispatch job ###')
  try {
    emailTrigger()
  } catch (e) {
    console.error(e)
  }
})

module.exports = { dailyFetch, dailyDispatch }
