"use strict"
const os = require("os")
const got = require("got")
const pMap = require("p-map")
const totalled = require("totalled")
const pEvent = require("p-event")
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

module.exports = pProgress(async (url, options, progress) => {
	if (!progress) {
		progress = options
		options = {}
	}

	options = {
		threads: os.cpus().length,
		retries: 3,
		...options
	}

	const { headers } = await got.head(url, options)
	const contentLength = Number(headers["content-length"])

	const currentDownloadProgress = new Array(options.threads)

	return Buffer.concat(await pMap(toByteRanges(cumulativeSum(splitInteger(contentLength, options.threads))), async ([startByte, endByte], threadId) => pRetry(async () => {
		const requestStream = got.stream(url, mergeOptions({
			headers: {
				range: `bytes=${startByte}-${endByte}`
			}
		}, options))

		requestStream.on("downloadProgress", ({ percent }) => {
			currentDownloadProgress[threadId] = percent
			progress(totalled(currentDownloadProgress) / options.threads)
		})

		requestStream.on("error", error => {
			throw error
		})

		const response = await pEvent(requestStream, "response")

		const [result] = await Promise.all([getStream.buffer(requestStream), response])
		return result
	}, {
		retries: options.retries
	})))
})
