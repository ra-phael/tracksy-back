const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { User } = require('./../../models/user')
const { Item } = require('./../../models/item')
const { ScrapedListing } = require('./../../models/scrapedListing')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const users = [{
  _id: userOneId,
  email: 'l@example.com',
  security: {
    question: 'Name of first pet?',
    answer: 'Wilfred'
  },
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }],
  watchedItems: [
    {
      '_id': ObjectID('5c4f39afdb2a213a78692e94')
    },
    {
      '_id': ObjectID('5c4f39afdb2a213a78692e95')
    }
  ]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  security: {
    question: 'Name of first school?',
    answer: 'LSE'
  },
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}]

const ITEMS = [
  {
    '_id': ObjectID('5c4f39afdb2a213a78692e95'),
    'brandDisplayName': 'Cartier',
    'brand': 'cartier',
    'name': 'Love Bracelet',
    'handle': 'love-bracelet',
    'category': 'jewelry',
    'dollarPriceThreshold': 5000,
    'lastListing': 362545283691.0,
    'lastScrape': new Date('2019-01-28T17:10:07.000Z')
  },
  {
    '_id': ObjectID('5c4f39afdb2a213a78692e94'),
    'brandDisplayName': 'Louis Vuitton',
    'brand': 'louis-vuitton',
    'name': 'Palms Springs Backpack',
    'handle': 'palms-springs-backpack',
    'category': 'hand-bags',
    'dollarPriceThreshold': 2100,
    'lastListing': 132935021550.0,
    'lastScrape': new Date('2019-01-28T17:10:07.000Z')
  }
]

const rawScrape = {
  '_id': ObjectID('5c5170f302203121c40dab16'),
  'platform': 'ebay',
  'timeStamp': '2019-01-30-22-53',
  'scraped': [
    {
      '_id': ObjectID('5c4f39afdb2a213a78692e95'),
      'brandDisplayName': 'Cartier',
      'brand': 'cartier',
      'name': 'Love Bracelet',
      'handle': 'love-bracelet',
      'lastListing': 362545283691.0,
      'listings': [
        {
          'url': 'https://www.ebay.com/itm/Cartier-Love-Bracelet-17-18k-Rose-Gold-Certificate-Tool-Pouch-MINT-B6035617/362545283691?hash=item546962026b:g:PGwAAOSw~R1cUgAN:rk:1:pf:1',
          'listingId': 362545283691.0,
          'title': 'Cartier Love Bracelet 17 18k Rose Gold Certificate/Tool/Pouch MINT B6035617',
          'price': 5400,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11c1')
        },
        {
          'url': 'https://www.ebay.com/itm/LADIES-CARTIER-LOVE-SIZE-17-SOLID-18K-750-YELLOW-GOLD-BANGLE-BRACELET/163516524581?hash=item2612582825:g:zloAAOSwHAxcKoyN:rk:2:pf:1',
          'listingId': 163516524581.0,
          'title': 'LADIES CARTIER LOVE SIZE 17 SOLID 18K 750 YELLOW GOLD BANGLE BRACELET',
          'price': 3100,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11c0')
        },
        {
          'url': 'https://www.ebay.com/itm/Cartier-LOVe-Bracelet-Rose-Gold-Size-16cm/312452262710?hash=item48bf9b2b36:g:vlEAAOSwgrZcUgRk:rk:3:pf:1',
          'listingId': 312452262710.0,
          'title': 'Cartier LOVe Bracelet Rose Gold Size 16cm',
          'price': 197,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11bf')
        },
        {
          'url': 'https://www.ebay.com/itm/STEAL-THIS-AUTHENTIC-6K-CARTIER-LOVE-BRACELET-YELLOW-GOLD-SZ-16/283359185327?hash=item41f98609af:g:huoAAOSwl1RcUfkq:rk:4:pf:1',
          'listingId': 283359185327.0,
          'title': 'STEAL THIS AUTHENTIC $6K CARTIER LOVE BRACELET YELLOW GOLD SZ 16',
          'price': 2100,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11be')
        }
      ]
    },
    {
      '_id': ObjectID('5c4f39afdb2a213a78692e94'),
      'brandDisplayName': 'Louis Vuitton',
      'brand': 'louis-vuitton',
      'name': 'Palms Springs Backpack',
      'handle': 'palms-springs-backpack',
      'lastListing': 132935021550.0,
      'listings': [
        {
          'url': 'https://www.ebay.com/itm/Authentic-Louis-Vuitton-Palm-Springs-Mini-Backpack-Style-Purse-Monogram-Canvas/132935021550?hash=item1ef38b73ee:g:mZoAAOSwRDJcUVJz:rk:1:pf:0',
          'listingId': 132935021550.0,
          'title': 'Authentic Louis Vuitton Palm Springs Mini Backpack Style Purse Monogram Canvas',
          'price': 564.68,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11bd')
        },
        {
          'url': 'https://www.ebay.com/itm/Louis-Vuitton-Palm-Springs-Backpack-Reverse-Monogram-Canvas-PM/113606643506?hash=item1a737bcf32:g:piIAAOSwFGNcUfBg:rk:2:pf:0',
          'listingId': 113606643506.0,
          'title': 'Louis Vuitton Palm Springs Backpack Reverse Monogram Canvas PM',
          'price': 2750,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11bc')
        }
      ]
    }
  ]
}

const rawNewScrape = {
  '_id': new ObjectID(),
  'platform': 'ebay',
  'timeStamp': '2019-02-07-22-53',
  'scraped': [
    {
      '_id': ObjectID('5c4f39afdb2a213a78692e95'),
      'brandDisplayName': 'Cartier',
      'brand': 'cartier',
      'name': 'Love Bracelet',
      'handle': 'love-bracelet',
      'lastListing': 362545283728.0,
      'listings': [
        {
          'url': 'https://www.ebay.com/itm/Cartier-Love-Bracelet-17-18k-Rose-Gold-Certificate-Tool-Pouch-MINT-B6035617/362545283728?hash=item546962026b:g:PGwAAOSw~R1cUgAN:rk:1:pf:1',
          'listingId': 362545283728.0,
          'title': 'Cartier Love Bracelet 17 18k Rose Gold Certificate/Tool/Pouch MINT B6035617',
          'price': 5400,
          'platform': 'ebay',
          'currency': 'USD',
          '_id': ObjectID('5c521cd49262630e18ef11c1')
        }
      ]
    }
  ]
}

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save()
    let userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

const populateItems = (done) => {
  Item.remove({}).then(() => {
    let itemOne = new Item(ITEMS[0]).save()
    let itemTwo = new Item(ITEMS[1]).save()

    return Promise.all([itemOne, itemTwo])
  }).then(() => done())
}

const populateNewScrape = (done) => {
  ScrapedListing.remove({}).then(() => {
    let newScrape = new ScrapedListing(rawScrape).save()

    return newScrape
  }).then(() => done())
}

module.exports = { users, populateUsers, populateItems, populateNewScrape, rawNewScrape }
