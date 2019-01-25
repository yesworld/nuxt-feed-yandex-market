# A Nuxt.js module that generates an XML file for Yandex.Market (YML)
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

A wrapper over [Yandex Market Language(YML)](https://github.com/LotusTM/yandex-market-language) that generates a JSON object into the xml file. The module supports Nuxt 2.x. There is `yarn run generate` support. 

## Simple usage

- Install `yarn add nuxt-feed-yandex-market`
- Add `nuxt-feed-yandex-market` to `modules` section of `nuxt.config.js`

```js
export default {
  modules: [
    'nuxt-feed-yandex-market'
  ],
  yandexMarket: {
    data: {}, // JSON with data or a function that returns the JSON 
    path: '/yandex-market.xml', // The route to your xml file
    validate: true,
    cacheTime: 1000 * 3600 * 24 
  }
}
```

## License

[MIT License](./LICENSE)

Copyright (c) Akhmedshin Damir
