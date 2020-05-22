/* jslint node: true, esnext: true */
'use strict';

import ChunkProcessorInterceptor from './ChunkProcessorInterceptor';
import {
  DataProcessorChunkFactory
}
from './data-processor-chunk';

import {
  createFunctions,
  createHashFunction
}
from './data-hash';

function registerWithManager(manager) {
  return manager.registerInterceptor(ChunkProcessorInterceptor);
}

export {
  DataProcessorChunkFactory,
  ChunkProcessorInterceptor,
  registerWithManager,
  createFunctions,
  createHashFunction
};
