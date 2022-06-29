# BrowserStreamingJson

Basic PoC for streaming JSON in the browser without Websockets/WebRTC. Makes a fetch request to an endpoint that slowly returns the elements of a JSON array (100 elements over 10 seconds). However, instead of waiting for the response to complete before anything happens, a `<p>` element is appended to the DOM for every element of the JSON array *as it arrives over the wire*.

Currently only works in Chrome, because [Firefox does not support TextDecoderStream](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream#browser_compatibility).

# Instructions

1. `yarn install`

2. `node server.js`

3. Navigate to `localhost:3000/test.html` in *Chrome* (see above for why Firefox won't work).

To test the mini-parser in isolation, run `node json_stream.js`.
