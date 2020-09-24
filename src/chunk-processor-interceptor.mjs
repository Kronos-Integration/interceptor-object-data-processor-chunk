import { Interceptor } from "kronos-interceptor";

import { DataProcessorChunkFactory } from "./data-processor-chunk.mjs";

/**
 * This interceptor cares about the handling of the messages.
 * It will add the hops and copies the messages
 */
export default class ChunkProcessorInterceptor extends Interceptor {
  constructor(config, endpoint) {
    super(config, endpoint);

    // just validate the config once
    DataProcessorChunkFactory(config.config, true);
  }

  static get name() {
    return "data-processor-chunk";
  }

  receive(request, oldRequest) {
    if (request.payload) {
      const streamFilter = DataProcessorChunkFactory(this.config.config);
      const stream = request.payload;
      request.payload = stream.pipe(streamFilter);
    }
    return this.connected.receive(request, oldRequest);
  }
}
