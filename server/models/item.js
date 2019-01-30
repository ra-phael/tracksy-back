const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    brandDisplayName: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    handle: {
        type: String,
        required: true,
    },
    lastListing: {
        type: Number
    },
    lastScrape: {
        type: Date
    },
    category: {
        type: String,
        required: true,
    }
})

const Item = mongoose.model('Item', ItemSchema);

module.exports = { Item };