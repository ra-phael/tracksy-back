

const makeItems = (items) => {
    let result = `${items.map(item => itemEl(item)).join('')}`
    // console.log(result);
    return result
}

const itemEl = (item) => (
    `<tr><td><p>${item.brandDisplayName} <b>${item.name}</b></p></td></tr>
    <tr><td><ul>${item.listings.map(listing => listingEl(listing)).join('')}</ul></td></tr>`
)

const listingEl = (listing) => (
    `<li>${listing.currency == 'USD' ? '$' : ''}${listing.price} - <a href=${listing.url} target="_blank">${listing.title}</a></li>`
)

module.exports = { makeItems };

