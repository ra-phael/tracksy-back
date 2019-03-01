require('../config/config');
const expect = require('expect');
const { ObjectID } = require('mongodb');
const rewire = require('rewire');

const { User } = require('./../models/user');
const { Item } = require('./../models/item');
const { ScrapedListing } = require('./../models/scrapedListing');
const { users, populateUsers, populateNewScrape, populateItems } = require('./seed/seed');
const consolidator = rewire('../cron/consolidator.js');
const getBaseThresholds = consolidator.__get__('getBaseThresholds');
const processNewListings = consolidator.__get__('processNewListings');
const filterItem = consolidator.__get__('filterItem');
const makeItemsToSend = consolidator.__get__('makeItemsToSend');

beforeEach(populateUsers);
beforeEach(populateItems);
beforeEach(populateNewScrape);

const rawNewScrape = {
    "_id" : new ObjectID(),
    "platform" : "ebay",
    "timeStamp" : "2019-02-07-22-53",
    "scraped" : [ 
        {
            "_id" : ObjectID("5c4f39afdb2a213a78692e95"),
            "brandDisplayName" : "Cartier",
            "brand" : "cartier",
            "name" : "Love Bracelet",
            "handle" : "love-bracelet",
            "lastListing" : 362545283728.0,
            "listings" : [ 
                {
                    "url" : "https://www.ebay.com/itm/Cartier-Love-Bracelet-17-18k-Rose-Gold-Certificate-Tool-Pouch-MINT-B6035617/362545283728?hash=item546962026b:g:PGwAAOSw~R1cUgAN:rk:1:pf:1",
                    "listingId" : 362545283728.0,
                    "title" : "Cartier Love Bracelet 17 18k Rose Gold Certificate/Tool/Pouch MINT B6035617",
                    "price" : 5400,
                    "platform" : "ebay",
                    "currency" : "USD",
                    "_id" : ObjectID("5c521cd49262630e18ef11c1")
                }
            ]
        }
    ]
}

describe('Get Base Thresholds', () => {
    it('should build the base thresholds', (done) => {
        getBaseThresholds()
            .then(thresh => {
                expect(typeof thresh['love-bracelet']).toBe('number');
                expect(typeof thresh['palms-springs-backpack']).toBe('number');
                done();
            })
            .catch(e => console.log(e))
    });
})

describe('Process New Listings', () => {
    // it('should handle invalid listings', (done) => {


    //     let wrongNewScrape1 = {...rawNewScrape, ...rawNewScrape.scraped[0].listings}
    //     let wrongNewScrape2 = {...rawNewScrape, ...rawNewScrape.scraped[0].listings}
    //     let wrongNewScrape3 = {...rawNewScrape, ...rawNewScrape.scraped[0].listings}

    //     // Missing title
    //     wrongNewScrape1.scraped[0].listings[0].title = '';
    //     wrongNewScrape2.scraped[0].listings[0].price = undefined;
    //     wrongNewScrape3.scraped[0].lastListing = undefined;

    //     console.log(wrongNewScrape2);
    // });

    it('should handle empty scraped listings', (done) => {
        let wrongNewScrape = {
            "_id" : ObjectID("5c521cd49262630e18ef11bb"),
            "platform" : "ebay",
            "timeStamp" : "2019-01-30-22-53",
            "scraped" : []
        }

        processNewListings(wrongNewScrape)
            .then(res => {})
            .catch(error => {
                expect(error).toBe('No new items scraped');

                ScrapedListing.findOne().sort({ "_id": -1 })
                    .exec(function(err, doc) { 
                        return doc
                    })
                    .then(doc => {
                        expect(doc._id.toString()).toEqual('5c521cd49262630e18ef11bb');
                        done();
                    })
            })
    });

    it('saves new scrape and update items', (done) => {
        // console.log(rawNewScrape.scraped[0].listings);
        processNewListings(rawNewScrape)
            .then(freshScrape => {
                expect(freshScrape._id.toString()).toEqual(rawNewScrape._id.toString());
                ScrapedListing.find().then(scrapes => expect(scrapes.length).toBe(2))

                Item.findById(rawNewScrape.scraped[0]._id).then(doc => {
                    expect(doc.lastListing).toBe(rawNewScrape.scraped[0].lastListing);
                    done();
                })
            })
            .catch(error => console.log(error))
    });
})

describe('Filter Item', () => {
    it('should filter out items', (done) => {
        ScrapedListing.find().then(scrapedListings => {

            let scrapedItem = scrapedListings[0].scraped[0];
            let matchingItem = users[0].watchedItems[1];
            let thresholds = {"love-bracelet": 2200, "palm-springs-backpack": 500}
            let filteredItem = filterItem(scrapedItem, matchingItem, thresholds);
            expect(filteredItem.listings.length).toBe(2);
            done();
        }) 
    });
})

describe('Make Items To Send', () => {
    it('should return items to send for each user', () => {
        let thresholds = {"love-bracelet": 2200, "palm-springs-backpack": 500};
        ScrapedListing.find().then(scrapedListings => {
            const itemsToSend = makeItemsToSend(users[0],scrapedListings[0], thresholds)
            expect(itemsToSend.length).toBe(1);
            expect(itemsToSend[0].listings.length).toBe(2);
        }).catch(error => console.log(error))
    });
})
