
/**
 * List of items in email
 * @param {Array} items
 */
const makeItems = (items) => {
  console.info('[makeItems]', items)
  let result = `${items.map(item => itemEl(item)).join('')}`
  return result
}

/**
 * Item section with listings
 * @param {Object} item
 */
const itemEl = (item) => (
  `<tr><td><p>${item.brandDisplayName} <b>${item.name}</b></p></td></tr>
    <tr><td><ul>${item.listings.map(listing => listingEl(listing)).join('')}</ul></td></tr>`
)

/**
 * Listing line in email
 * @param {Object} listing
 */
const listingEl = (listing) => (
  `<li>${listing.currency === 'USD' ? '$' : ''}${listing.price} - <a href=${listing.url} target="_blank">${listing.title}</a></li>`
)

module.exports = { makeItems }
