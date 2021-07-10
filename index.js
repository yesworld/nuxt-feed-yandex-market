import fs from 'fs-extra'
import yml from 'yandex-market-language'
import path from 'path'
import pify from 'pify'
import AsyncCache from 'async-cache'

const defaultOptions = {
  path: '/feed-yandex-market.xml',
  cacheTime: 1000 * 3600 * 24,
  validate: true,
  data: {} // or function
}

export default async function yandexMarket () {
  let options = this.options.yandexMarket || this.options.feedYml
  if (!Array.isArray(options)) {
    options = [options]
  }

  options.map(option => Object.assign(defaultOptions, option))

  const feedCache = new AsyncCache({
    load (key, callback) {
      generate(options[key], callback)
        .catch(err => console.error(err))
    }
  })

  feedCache.get = pify(feedCache.get)

  options.forEach((feedOptions, index) => {
    this.nuxt.hook('generate:before',
      async () => {
        const xmlGeneratePath = path.resolve(this.options.srcDir, path.join('static', feedOptions.path))
        await fs.removeSync(xmlGeneratePath)
        await fs.outputFile(xmlGeneratePath, await feedCache.get(index))

        console.info('🗒 Generated feed: ', feedOptions.path)
      }
    )

    this.addServerMiddleware({
      path: feedOptions.path,
      async handler (req, res, next) {
        try {
          const xml = await feedCache.get(index)
          res.setHeader('Content-Type', 'application/xml; charset=UTF-8')
          res.end(xml)
        } catch (err) /* istanbul ignore next */ {
          next(err)
        }
      }
    })
  })
}

async function generate (options, callback) {
  let xml
  try {
    const data = (typeof options.data === 'function') ? await options.data() : options.data

    xml = yml(data, { validate: options.validate })
      .end({ pretty: true })
  } catch (err) /* istanbul ignore next */ {
    console.error('⚠️ Error while executing module yandex-market-language')
    console.error(err)
  }

  return callback(null, xml, options.cacheTime)
}

module.exports.meta = require('./package.json')
