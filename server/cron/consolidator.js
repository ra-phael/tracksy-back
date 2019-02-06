const { mongoose } = require('../db/mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { ScrapedListing } = require('../models/scrapedListing')
const { User } = require('../models/user');
const { Item } = require('../models/item');
const { sendListings } = require('../email/emailService')

const getBaseThresholds = () => {
    return new Promise((resolve, reject) => {
         Item.find({})
            .then(items => resolve(items
                .reduce((obj, item) => (
                    obj[item.handle] = item.dollarPriceThreshold,
                    obj
                ), {})
            ))
    })
}

const processNewListings = (newListings) => {
    let freshScrape = new ScrapedListing(newListings);
    freshScrape.save()

    // Update lastListing in Item collection
    newListings.scraped.forEach(item => {
        Item.findByIdAndUpdate( item._id, { $set: { lastListing: item.lastListing }}, (err, el) => {
            if(err) console.log("Error while updating Item", err);
        })
    });
    console.log("Saved fresh listings in DB");
}

const filterItem = (item, watchedItem, thresholds) => {
    // Set user defined price threshold *if any* or base price threshold if not
    let priceThreshold = watchedItem.hasOwnProperty('priceThreshold') 
        ? watchedItem.priceThreshold : thresholds[item.handle]

    let filteredListings = item.listings
        .filter(listing => {
            return Number(listing.price) < priceThreshold
        })
        
    let filteredItem = Object.assign(item._doc, {listings: filteredListings});

    return filteredItem
}

const mainConsolidator = (newScrape, baseThresholds) => {
    User.find({})
        .then(users => { 
            users.forEach(user => {
                let itemsToSend = [];
                
                newScrape.scraped.forEach(item => {
                    let itemId = new ObjectId(item._id)

                    let matchingWatchedItem = user.watchedItems
                    .filter(obj => obj._id.equals(itemId));
                    matchingWatchedItem = matchingWatchedItem[0];
                    console.log("Matching item", matchingWatchedItem);

                    if(matchingWatchedItem) {
                        // console.log(`New ${item.name} for ${user.email}`);
                        itemsToSend.push(filterItem(item, matchingWatchedItem, baseThresholds))
                    }
                });
                if(itemsToSend && itemsToSend.length) {
                    console.log("Items to send: ", itemsToSend);
                    sendListings(user, itemsToSend);
                }
            })
            
        })
        .catch(e => console.log("[mainConsolidator] :", e))
}

const prepareDailyDeals = (newScrape) => {
    getBaseThresholds().then(baseThresholds => {
        console.log("thresholds:", baseThresholds);
        mainConsolidator(newScrape, baseThresholds)
    })
}

module.exports = { processNewListings, prepareDailyDeals };