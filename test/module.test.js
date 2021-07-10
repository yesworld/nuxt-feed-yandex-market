const { Nuxt, Builder, Generator } = require('nuxt')
const config = require('./fixture/nuxt.config')
const config2 = require('./fixture/nuxt.config.array')
const path = require('path')
const fs = require('fs-extra')
const oldFs = require('fs')
const timeout = 180 * 1000
const PORT = 3777

describe('generate', () => {
  test('generate xml', async (done) => {
    const nuxt = new Nuxt(config)
    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', '/yandex-market.xml'))
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

  test('generate xml array of setting', async (done) => {
    const nuxt = new Nuxt(config2)

    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', '/yandex-market.xml'))
    const filePath2 = path.resolve(nuxt.options.srcDir, path.join('static', '/aliexpress.xml'))
    fs.removeSync(filePath)
    fs.removeSync(filePath2)

    const generator = new Generator(nuxt, new Builder(nuxt))
    await generator.initiate()
    await generator.initRoutes()

    expect(fs.readFileSync(filePath, { encoding: 'utf8' })).toMatchSnapshot()
    expect(fs.readFileSync(filePath2, { encoding: 'utf8' })).toMatchSnapshot()

    const { errors } = await generator.generate()
    fs.removeSync(filePath)
    fs.removeSync(filePath2)
    expect(Array.isArray(errors)).toBe(true)
    expect(errors.length).toBe(0)

    done()
  }, timeout)
})

describe('universal', () => {
  const request = require('request-promise-native')

  const url = path => `http://localhost:${PORT}${path}`
  const get = path => request(url(path))

  let nuxt
  afterEach(async () => {
    if (nuxt) {
      await nuxt.close()
    }
  })

  test('check xml', async (done) => {
    nuxt = new Nuxt(config)
    await nuxt.ready()
    await new Builder(nuxt).build()
    nuxt.listen(PORT)

    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', '/yandex-market.xml'))
    if (oldFs.existsSync(filePath)) {
      fs.removeSync(filePath)
    }

    let html = await get('/yandex-market.xml')
    expect(html).toMatchSnapshot()

    done()
  }, timeout)

  test('check xml 2', async (done) => {
    let nuxt = new Nuxt(config2)
    await nuxt.ready()
    await new Builder(nuxt).build()
    nuxt.listen(PORT)

    const filePath = path.resolve(nuxt.options.srcDir, path.join('static', '/yandex-market.xml'))
    const filePath2 = path.resolve(nuxt.options.srcDir, path.join('static', '/aliexpress.xml'))
    if (oldFs.existsSync(filePath)) {
      fs.removeSync(filePath)
    }

    if (oldFs.existsSync(filePath2)) {
      fs.removeSync(filePath2)
    }

    let xml = await get('/yandex-market.xml')
    expect(xml).toMatchSnapshot()
    let xml2 = await get('/aliexpress.xml')
    expect(xml2).toMatchSnapshot()

    done()
  }, timeout)
})
