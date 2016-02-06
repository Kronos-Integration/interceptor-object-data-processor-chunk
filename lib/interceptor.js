/* jslint node: true, esnext: true */
"use strict";

const Interceptor = require('kronos-interceptor').Interceptor;
const parserFactory = require('./data-processor-chunk');

/**
 * This interceptor cares about the handling of the messages.
 * It will add the hops and copies the messages
 */
class ChunkProcessorInterceptor extends Interceptor {

	constructor(config, endpoint) {
		super(config, endpoint);

		// just validate the config once
		parserFactory(config.config, true);
	}

	static get name() {
		return "data-processor-chunk";
	}

	get type() {
		return ChunkProcessorInterceptor.name;
	}

	receive(request, oldRequest) {
		if (request.payload) {
			const streamFilter = parserFactory(this.config.config);
			const stream = request.payload;
			request.payload = stream.pipe(streamFilter);
		}
		return this.connected.receive(request, oldRequest);
	}
}
exports.Interceptor = ChunkProcessorInterceptor;
