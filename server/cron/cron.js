const cron = require('cron');
const { pingCall, fetchNewListings } = require('./racleur');
const { ScrapedListing } = require('../models/scrapedListing');
const { processNewListings, prepareDailyDeals } = require('./consolidator')

const dailyFetch = new cron.CronJob('0 30 11 * * *', () => {
    console.log("## Running daily fetch job ###");
    
    pingCall()
        .then(statusCode => {
            if(statusCode == 200) {
                fetchNewListings()
                    .then(data => processNewListings(data))
                    .catch(error => console.log(error));
            }
        });
})

const dailyDispatch = new cron.CronJob('0 45 11 * * *', () => {
    // Get the latest scrape
    ScrapedListing.findOne().sort({ "_id": -1 })
        .exec(function(err, doc) { 
            // console.log("Latest scrape:", doc);
            if(err) return err;
            prepareDailyDeals(doc);
         });
})

module.exports = { dailyFetch, dailyDispatch };
