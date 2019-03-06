const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId

const ListingSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  listingId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  }
})

const ScrapedItemSchema = new mongoose.Schema({
  _id: {
    type: ObjectId,
    required: true
  },
  brandDisplayName: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  lastListing: {
    type: Number
  },
  listings: [ListingSchema]
})

const ScrapedListingSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  timeStamp: {
    type: String,
    required: true
  },
  scraped: [ScrapedItemSchema]
})

const ScrapedListing = mongoose.model('ScrapedListing', ScrapedListingSchema)

module.exports = { ScrapedListing }
