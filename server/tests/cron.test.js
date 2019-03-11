const expect = require('expect')
const rewire = require('rewire')
const cron = rewire('../cron/cron')
const emailTrigger = cron.__get__('emailTrigger')

describe('dailyDispatch - Triggers email sending', () => {
  it('should not move forward with scraped listings older than today', async () => {
    try {
      await emailTrigger()
    } catch (e) {
      expect(e).toEqual(Error('Last scraped listing is older than today'))
    }
  })
})
