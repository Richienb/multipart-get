const test = require("ava")
const pify = require("pify")
const imageType = require("image-type")
const multipartGet = require(".")

test("main", async t => {
	const request = multipartGet("https://source.unsplash.com/random")

	const progressEventData = await pify(request.onProgress, { errorFirst: false }).bind(request)()

	t.is(typeof progressEventData, "number")
	t.is(typeof imageType(await request), "object")
})
