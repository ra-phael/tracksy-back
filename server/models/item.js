const mongoose = require('mongoose');
const validator = require('validator');

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
    category: {
        type: String,
        required: true,
    }
})

const Item = mongoose.model('Item', ItemSchema);

module.exports = { Item };