const test = require("ava")
const pify = require("pify")
const multipartGet = require(".")

test("main", async t => {
	const request = multipartGet("https://source.unsplash.com/random")

	const progressEventData = await pify(request.onProgress, { errorFirst: false }).bind(request)()

	t.is(typeof progressEventData, "number")
	t.true(Buffer.isBuffer(await request))
})
