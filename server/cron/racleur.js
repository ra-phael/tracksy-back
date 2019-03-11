const rax = require('retry-axios')
const axios = require('axios')
const { Item } = require('../models/item')

const BASE_URL = 'https://tracksy-racleur.herokuapp.com'
// const BASE_URL = 'http://127.0.0.1:5000'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000
})

axiosInstance.defaults.raxConfig = {
  instance: axiosInstance,
  // Retry 3 times on requests that return a response (500, etc) before giving up.  Defaults to 3.
  retry: 3,
  // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
  noResponseRetries: 2,
  // Milliseconds to delay at first.  Defaults to 100.
  retryDelay: 100
}
const interceptorId = rax.attach(axiosInstance)

const pingCall = () => {
  return axiosInstance.get('/ping')
    .then(res => res.status)
    .catch(e => console.error('Racleur ping error:', e))
}

const fetchNewListings = () => {
  console.info('## Fetching New Listings ##')

  return Item.find({})
    .then(items => {
      console.info('Formatting items to fetch')

      let itemsToFetch = items.map(item => ({
        _id: item._id,
        brandDisplayName: item.brandDisplayName,
        brand: item.brand,
        name: item.name,
        handle: item.handle,
        lastListing: item.lastListing
      }))

      itemsToFetch = {
        items: itemsToFetch
      }
      console.info('Items to fetch before call', itemsToFetch)
      return new Promise((resolve, reject) => {
        instance.post('/listings', itemsToFetch)
          .then(res => {
            resolve(res.data)
          })
          .catch(e => reject(e))
      })
    })
}

module.exports = { pingCall, fetchNewListings }
