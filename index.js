import fs from 'fs-extra'
import yml from 'yandex-market-language'
import path from 'path'
import pify from 'pify'
import AsyncCache from 'async-cache'

const defaultOptions = {
  path: '/feed-yandex-market.xml',
  cacheTime: 1000 * 3600 * 24,
  validate: true,
  data: {}
}

export default async function yandexMarket () {
  const options = Object.assign(defaultOptions, this.options.yandexMarket)

  const feedCache = new AsyncCache({
    load (key, callback) {
      generate(options, callback)
        .catch(err => console.error(err))
    }
  })

  feedCache.get = pify(feedCache.get)

  this.nuxt.hook('generate:before',
    async () => {
      const xmlGeneratePath = path.resolve(this.options.srcDir, path.join('static', options.path))
      await fs.removeSync(xmlGeneratePath)
      await fs.outputFile(xmlGeneratePath, await feedCache.get('yml'))
    }
  )

  this.addServerMiddleware({
    path: options.path,
    async handler (req, res, next) {
      try {
        const xml = await feedCache.get('yml')
        res.setHeader('Content-Type', 'application/xml; charset=UTF-8')
        res.end(xml)
      } catch (err) /* istanbul ignore next */ {
        next(err)
      }
    }
  })

  async function generate (options, callback) {
    let xml
    try {
      let data = (typeof options.data === 'function') ? await options.data() : options.data

      xml = yml(data, { validate: options.validate })
        .end({ pretty: true })
    } catch (err) /* istanbul ignore next */ {
      console.error('⚠️ Error while executing module yandex-market-language')
      console.error(err)
    }

    return callback(null, xml, options.cacheTime)
  }
}

module.exports.meta = require('./package.json')
