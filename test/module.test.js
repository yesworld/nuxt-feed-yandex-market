const { Nuxt, Builder, Generator } = require('nuxt')
const config = require('./fixture/nuxt.config')
const path = require('path')
const fs = require('fs-extra')
const oldFs = require('fs')
const timeout = 180 * 1000
const urlFeed = '/yandex-market.xml'

describe('generate', async () => {
  test('generate xml', async (done) => {
    const nuxt = new Nuxt(config)
    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', urlFeed))
    fs.removeSync(filePath)

    const generator = new Generator(nuxt, new Builder(nuxt))
    await generator.initiate()
    await generator.initRoutes()

    expect(fs.readFileSync(filePath, { encoding: 'utf8' })).toMatchSnapshot()

    const { errors } = await generator.generate()
    fs.removeSync(filePath)
    expect(Array.isArray(errors)).toBe(true)
    expect(errors.length).toBe(0)

    done()
  }, timeout)
})

describe('universal', () => {
  const request = require('request-promise-native')

  const url = path => `http://localhost:3000${path}`
  const get = path => request(url(path))

  test('check xml', async (done) => {
    let nuxt = new Nuxt(config)
    new Builder(nuxt).build()
    nuxt.listen(3000)

    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', urlFeed))
    if (oldFs.existsSync(filePath)) {
      fs.removeSync(filePath)
    }

    let html = await get(urlFeed)
    expect(html).toMatchSnapshot()

    done()
  }, timeout)
})
