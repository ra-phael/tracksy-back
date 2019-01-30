const { mongoose } = require('../db/mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { ScrapedListing } = require('../models/scrapedListing')
const { User } = require('../models/user');
const { Item } = require('../models/item');
const { sendListings } = require('../email/emailService')


const processNewListings = (newListings) => {
    let freshScrape = new ScrapedListing(newListings);
    freshScrape.save()
    newListings.scraped.forEach(item => {
        Item.findByIdAndUpdate( item._id, { $set: { lastListing: item.lastListing }}, (err, el) => {
            if(err) console.log("Error while updating Item", err);
        })
    });
    console.log("Saved fresh listings in DB");
}


const prepareDailyDeals = (newScrape) => {
    User.find({})
        .then(users => { 
            users.forEach(user => {
                let listingsToSend = [];
                newScrape.scraped.forEach(item => {
                    let itemId = new ObjectId(item._id)
                    // console.log(user.watchedItems.some(id => id.equals(itemId)));
                    if(user.watchedItems.some(id => id.equals(itemId))) {
                        // console.log(`New ${item.name} for ${user.email}`);
                        listingsToSend.push(item)
                    }
                });
                sendListings(user, listingsToSend);
                // console.log("Listings to send: ", listingsToSend);
            })
            
        })
        .catch(e => console.log("[Prepare daily deals] :", e))
}

module.exports = { processNewListings, prepareDailyDeals };