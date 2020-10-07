# multipart-get [![Travis CI Build Status](https://img.shields.io/travis/com/Richienb/multipart-get/master.svg?style=for-the-badge)](https://travis-ci.com/Richienb/multipart-get)

Run multiple http requests in parallel. Useful for downloading a large file with higher speeds.

[![NPM Badge](https://nodei.co/npm/multipart-get.png)](https://npmjs.com/package/multipart-get)

## Install

```sh
npm install multipart-get
```

## Usage

```js
const { promises: fs } = require("fs")
const multipartGet = require("multipart-get")

await fs.writeFile("unicorn.png", await multipartGet("https://example.com/unicorn.png"))
```

## API

### multipartGet(url, options?)

Returns a promise which resolves with a buffer.

#### url

Type: `string`

The url to send the http requests to.

#### options

Type: `object`

Same options as [`got`](Same options as [`got`](https://github.com/sindresorhus/got#options)) in addition to the following:

##### threads

Type: `number`\
Default: Amount of cpu cores

The number of request threads to use in parallel.

### Progress updates

You can call `.onProgress` on the resulting promise and provide it with a callback to receive progress updates on the http request. The callback will be called with a float between `0` and `1` representing the completion percentage.

```js
const { promises: fs } = require("fs")
const multipartGet = require("multipart-get")

const request = multipartGet("https://example.com/unicorn.png")

request.onProgress(percent => {
	console.log(`The request is now ${Math.round(percent * 100)}% complete.`)
})

await fs.writeFile("unicorn.png", await request)
```
