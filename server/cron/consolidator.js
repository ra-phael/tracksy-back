const { mongoose } = require('../db/mongoose')
const ObjectId = mongoose.Types.ObjectId

const { ScrapedListing } = require('../models/scrapedListing')
const { User } = require('../models/user')
const { Item } = require('../models/item')
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
      .catch(e => reject(new Error(e)))
  })
}

const saveFreshScrape = (newListings) => {
  // console.log('newListings:', newListings.scraped[0].listings);
  return new Promise((resolve, reject) => {
    let freshScrape = new ScrapedListing(newListings)
    freshScrape.save()
      .then(scrape => resolve(scrape))
      .catch(e => reject(e))
  })
}

// Save fresh listings and update lastListing in Item collection
const processNewListings = (newListings) => {
  return new Promise((resolve, reject) => {
    if (newListings.scraped.length === 0) {
      reject(new Error('No new items scraped'))
    }

    saveFreshScrape(newListings)
      .then(scrape => {

        newListings.scraped.forEach(item => {
          Item.findByIdAndUpdate(item._id,
            { $set: { lastListing: item.lastListing } },
            (err, el) => {
              if (err) reject(err)
            }
          )
        })
        console.info('Saved fresh listings in DB')
        resolve(scrape)
      })
      .catch(error => {
        reject(error)
      })
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

  let filteredItem = Object.assign(item._doc, { listings: filteredListings })

  return filteredItem
}

const makeItemsToSend = (user, newScrape, baseThresholds) => {
  let itemsToSend = []

  newScrape.scraped.forEach(scrapedItem => {
    let scrapedItemId = new ObjectId(scrapedItem._id)

    let matchingWatchedItem = user.watchedItems
      .filter(obj => obj._id.equals(scrapedItemId))[0]
    // console.log("Matching item", matchingWatchedItem);

    if (matchingWatchedItem) {
      // console.log(`New ${scrapedItem.name} for ${user.email}`);
      let filteredItem = filterItem(scrapedItem, matchingWatchedItem, baseThresholds)
      // console.log("filteredItem:", filteredItem);
      if (filteredItem.listings && filteredItem.listings.length) {
        itemsToSend.push(filteredItem)
      }
    }
  })

  return itemsToSend
}

const mainConsolidator = (newScrape, baseThresholds) => {
  User.find({})
    .then(users => {
      users.forEach(user => {
        let itemsToSend = makeItemsToSend(user, newScrape, baseThresholds)

        if (itemsToSend && itemsToSend.length) {
          console.info('Items to send: ', itemsToSend)
          sendListings(user, itemsToSend)
        }
      })
    })
    .catch(e => console.error('[mainConsolidator] :', e))
}

const prepareDailyDeals = (newScrape) => {
  getBaseThresholds().then(baseThresholds => {
    mainConsolidator(newScrape, baseThresholds)
  })
}

module.exports = { processNewListings, prepareDailyDeals }
