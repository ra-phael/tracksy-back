const axios = require('axios');
const { Item } = require('../models/item');

// const BASE_URL = 'https://tracksy-racleur.herokuapp.com';
const BASE_URL = 'http://127.0.0.1:5000';

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
  });

const pingCall = () => {
    return instance.get('/ping')
        .then( res => res.status )
        .catch( e => console.log('Racleur ping error:', e))
}


const fetchNewListings = () => {
    console.log("## Fetching New Listings ##");
    
    return Item.find({})
        .then(items => {
            console.log("Formatting items to fetch");
            
            itemsToFetch = items.map(item => ({
                _id: item._id,
                brandDisplayName: item.brandDisplayName,
                brand: item.brand,
                name: item.name,
                handle: item.handle,
                lastListing: item.lastListing
            }));

            itemsToFetch = { 
                items: itemsToFetch
            }
            console.log("Items to fetch before call", itemsToFetch);
            return new Promise((resolve, reject) => {
                instance.post('/listings', itemsToFetch)
                    .then( res => {
                        resolve(res.data)
                    })
                    .catch( e => reject('Error while trying to fetch new listings:', e))
            })
        })
}

module.exports = { pingCall, fetchNewListings };