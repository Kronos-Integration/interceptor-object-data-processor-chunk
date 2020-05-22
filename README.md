[![npm](https://img.shields.io/npm/v/@kronos-integration/interceptor-object-data-processor-chunk.svg)](https://www.npmjs.com/package/@kronos-integration/interceptor-object-data-processor-chunk)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/@kronos-integration/interceptor-object-data-processor-chunk)](https://bundlephobia.com/result?p=@kronos-integration/interceptor-object-data-processor-chunk)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/interceptor-object-data-processor-chunk.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/interceptor-object-data-processor-chunk)
[![Build Action Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Finterceptor-object-data-processor-chunk%2Fbadge&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/interceptor-object-data-processor-chunk/goto)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/interceptor-object-data-processor-chunk.git)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/interceptor-object-data-processor-chunk/badge.svg)](https://snyk.io/test/github/Kronos-Integration/interceptor-object-data-processor-chunk)
[![codecov.io](http://codecov.io/github/Kronos-Integration/interceptor-object-data-processor-chunk/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/interceptor-object-data-processor-chunk?branch=master)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/interceptor-object-data-processor-chunk/badge.svg)](https://coveralls.io/r/Kronos-Integration/interceptor-object-data-processor-chunk)

kronos-interceptor-object-data-processor-chunk
=====
Splits a line by a sparator into tokens

# API Reference

* <a name="createFunctions"></a>

## createFunctions(chunkDefinition)
Creates the checks for checking boolean values

**Kind**: global function  

| Param | Description |
| --- | --- |
| chunkDefinition | The chunk definition for these records. |


* <a name="createHashFunction"></a>

## createHashFunction(hashFields, hashName)
Creates a function which generates a hash from the given content and stores the generated Hash under the given name in the record

**Kind**: global function  

| Param | Description |
| --- | --- |
| hashFields | All the field names used to create the hash |
| hashName | The name to be used to store the hash value back in the record |


* <a name="addError"></a>

## addError(data, error)
Adds an error to the stream data

**Kind**: global function  

| Param | Description |
| --- | --- |
| data | The current stream data |
| error | The error to be added. |


* <a name="createTmpHashAction"></a>

## createTmpHashAction()
Creates a hash function to compute a content hash without the multirow fields

**Kind**: global function  

* <a name="DataProcessorChunk+addRowActions"></a>

## dataProcessorChunk.addRowActions()
Add custom actions to the rowActions.
These actions will be executed per row

**Kind**: instance method of [<code>DataProcessorChunk</code>](#DataProcessorChunk)  

* <a name="DataProcessorChunk+_transform"></a>

## dataProcessorChunk._transform()
Reads the stream data and split it into lines.

**Kind**: instance method of [<code>DataProcessorChunk</code>](#DataProcessorChunk)  

* <a name="DataProcessorChunk+_flush"></a>

## dataProcessorChunk._flush()
Flushes the data.
Only needed if there are multi row fields used

**Kind**: instance method of [<code>DataProcessorChunk</code>](#DataProcessorChunk)  

* * *

install
=======

With [npm](http://npmjs.org) do:

```shell
npm install kronos-interceptor-object-data-processor-chunk
```

license
=======

BSD-2-Clause
