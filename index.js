"use strict"
const os = require("os")
const got = require("got")
const pMap = require("p-map")
const average = require("math-avg")
const getStream = require("get-stream")
const { fn: pProgress } = require("p-progress")
const splitInteger = require("split-integer")
const mergeOptions = require("merge-options")
const cumulativeSum = require("cumulative-sum")
const pRetry = require("p-retry")

const toByteRanges = array => array.map((bytes, index, byteParts) => {
	if (index === 0) {
		return [0, bytes - 1]
	}

	if (index === byteParts.length - 1) {
		return [byteParts[index - 1], bytes]
	}

	return [byteParts[index - 1], bytes - 1]
})

module.exports = (url, options) => pProgress(async progress => {
	options = {
		threads: os.cpus().length,
		retries: 3,
		...options
	}

	const { headers, url: finalUrl } = await got.head(url, options)
	const contentLength = Number(headers["content-length"])

	const currentDownloadProgress = Array.from({ length: options.threads }).fill(0)

	return Buffer.concat(await pMap(toByteRanges(cumulativeSum(splitInteger(contentLength, options.threads))), async ([startByte, endByte], threadId) => pRetry(async () => {
		const requestStream = got.stream(finalUrl, mergeOptions({
			headers: {
				range: `bytes=${startByte}-${endByte}`
			}
		}, options))

		requestStream.on("downloadProgress", ({ percent }) => {
			currentDownloadProgress[threadId] = percent
			progress(average(currentDownloadProgress))
		})

		requestStream.on("error", error => {
			throw error
		})

		return getStream.buffer(requestStream)
	}, {
		retries: options.retries
	}), {
		concurrency: options.threads
	}))
})()
