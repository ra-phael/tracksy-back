const cron = require('cron');
const { pingCall, fetchNewListings } = require('./racleur');
const { ScrapedListing } = require('../models/scrapedListing');
const { processNewListings, prepareDailyDeals } = require('./consolidator')

// new cron.CronJob('0 */35 * * * *',
const dailyFetch = () => {
    console.log("## Running daily cron job ###");
    
    pingCall()
        .then(statusCode => {
            if(statusCode == 200) {
                fetchNewListings()
                    .then(data => processNewListings(data))
                    .catch(error => console.log(error));
            }
        });
}


const dailyDispatch = () => {
    // Get the latest
    ScrapedListing.findOne().sort({ "_id": -1 })
        .exec(function(err, doc) { 
            // console.log("Latest scrape:", doc);
            if(err) return err;
            prepareDailyDeals(doc);
         });
}

module.exports = { dailyFetch, dailyDispatch };
