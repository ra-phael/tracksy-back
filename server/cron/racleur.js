const axios = require('axios')
const { Item } = require('../models/item')

const BASE_URL = 'https://tracksy-racleur.herokuapp.com'
// const BASE_URL = 'http://127.0.0.1:5000'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000
})
/**
 * Ping the scraping server
 */
const pingCall = () => {
  return axiosInstance.get('/ping')
    .then(res => res.status)
    .catch(e => { throw e })
}

/**
 * Get items to fetch from DB and new listings for these
 * from the scraping server
 * @return {Promise} New listings
 */
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
        axiosInstance.post('/listings', itemsToFetch)
          .then(res => {
            resolve(res.data)
          })
          .catch(e => reject(e))
      })
    })
}

module.exports = { pingCall, fetchNewListings }
