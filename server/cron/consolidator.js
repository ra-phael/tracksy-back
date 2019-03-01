const { mongoose } = require('../db/mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { ScrapedListing } = require('../models/scrapedListing')
const { User } = require('../models/user');
const { Item } = require('../models/item');
const { sendListings } = require('../email/emailService')

// Returns an object of base thresholds like
// {love-bracelet: 2000, palm-springs-backpack: 500}
const getBaseThresholds = () => {
    return new Promise((resolve, reject) => {
         Item.find({})
            .then(items => resolve(items
                .reduce((obj, item) => (
                    obj[item.handle] = item.dollarPriceThreshold,
                    obj
                ), {})
            ))
            .catch(e => reject("Error building base thresholds:", e))
    })
}

const saveFreshScrape = (newListings) => {
    // console.log('newListings:', newListings.scraped[0].listings);
    let freshScrape = new ScrapedListing(newListings);
    return freshScrape.save((err, scrape) => {
        if(err) throw new Error("Error while saving freshScrape", err)
        return scrape
    })
}

// Save fresh listings and update lastListing in Item collection
const processNewListings = (newListings) => {
    return new Promise ((resolve, reject) => {
        // save it in any case for reference
        saveFreshScrape(newListings)
        .then(scrape => {
            if(newListings.scraped.length == 0) {
                reject("No new items scraped")
            }
            
            newListings.scraped.forEach(item => {
                Item.findByIdAndUpdate( item._id,
                    { $set: { lastListing: item.lastListing }},
                    (err, el) => {
                        if(err) reject("Error while updating Item", err);
                    }
                )
            });
            console.log("Saved fresh listings in DB");
            resolve(scrape);
        })
        .catch(error => reject(error))

    })
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

const makeItemsToSend = (user, newScrape, baseThresholds) => {
    let itemsToSend = [];
                
    newScrape.scraped.forEach(scrapedItem => {
        let scrapedItemId = new ObjectId(scrapedItem._id)

        let matchingWatchedItem = user.watchedItems
            .filter(obj => obj._id.equals(scrapedItemId))[0];
        // console.log("Matching item", matchingWatchedItem);

        if(matchingWatchedItem) {
            // console.log(`New ${scrapedItem.name} for ${user.email}`);
            let filteredItem = filterItem(scrapedItem, matchingWatchedItem, baseThresholds);
            // console.log("filteredItem:", filteredItem);
            if(filteredItem.listings && filteredItem.listings.length) {
                itemsToSend.push(filteredItem);
            }
        }
    })

    return itemsToSend
}


const mainConsolidator = (newScrape, baseThresholds) => {
    User.find({})
        .then(users => { 
            users.forEach(user => {
                let itemsToSend = makeItemsToSend(user, newScrape, baseThresholds);

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