/// <reference types="node"/>
import { Options as GotOptions } from "got"

declare namespace multipartGet {
	export interface Options extends GotOptions {
		/**
		The number of request threads to use in parallel.

		@default Amount of cpu cores
		*/
		threads?: number

		/**
		The maximum amount of times to try downloading each chunk of data before failing.

		@default 3
		*/
		retries?: number
	}
}

/**
Run multiple http requests in parallel.

@param url The url to send the http requests to.

@example
```
const { promises: fs } = require("fs")
const multipartGet = require("multipart-get")

await fs.writeFile("unicorn.png", await multipartGet("https://example.com/unicorn.png"))
```
*/
declare function multipartGet(url: string, options?: multipartGet.Options): Promise<Buffer> & {
	/**
	The provided callback will be called for each progress update for the http request. The callback will be called with a decimal between `0` and `1` representing the completion percentage.
	*/
	onProgress: (progress: (progress: number) => void) => void
}

export = multipartGet
