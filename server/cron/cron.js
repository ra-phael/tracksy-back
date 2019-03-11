require('../config/config')
const cron = require('cron')
const { pingCall, fetchNewListings } = require('./racleur')
const { ScrapedListing } = require('../models/scrapedListing')
const { processNewListings, prepareDailyDeals } = require('./consolidator')



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

// Triggers new scraping
const dailyFetch = new cron.CronJob('0 30 11 * * *', () => {
  console.info('## Running daily fetch job ###')
  scrapeTrigger()
})

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

// Triggers email preparation and sending
const dailyDispatch = new cron.CronJob('0 45 11 * * *', () => {
  console.info('## Running daily dispatch job ###')
  try {
    emailTrigger()
  } catch (e) {
    console.error(e)
  }
})

module.exports = { dailyFetch, dailyDispatch }
