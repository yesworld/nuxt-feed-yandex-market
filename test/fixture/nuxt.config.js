const { resolve } = require('path')
const { MAX_VALID_INPUT } = require('../../node_modules/yandex-market-language/tests/fixtures/inputs')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: ['@@'],
  yandexMarket: {
    path: '/yandex-market.xml',
    cacheTime: 1000 * 3600,
    validate: true,
    data () {
      /* Ajax */
      return MAX_VALID_INPUT
    }
  }
}
