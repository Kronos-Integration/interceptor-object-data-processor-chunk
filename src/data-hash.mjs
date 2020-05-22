/* jslint node: true, esnext: true */
'use strict';

const md5 = require('md5');

/**
 * Creates the checks for checking boolean values
 * @param chunkDefinition The chunk definition for these records.
 */
function createFunctions(chunkDefinition) {

	// all the field names used to build the key for a record and a name to store the hash
	const keyHashFields = chunkDefinition.keyHashFields;
	const keyHashName = chunkDefinition.keyHashName;

	// all the field names used to build the content hash for a record and a name to store the hash
	const contentHashFields = chunkDefinition.contentHashFields;
	const contentHashName = chunkDefinition.contentHashName;

	// all the field names used to build the content hash for a record and a name to store the hash
	const scopeHashFields = chunkDefinition.scopeHashFields;
	const scopeHashName = chunkDefinition.scopeHashName;

	if (keyHashName === undefined || keyHashName === null || keyHashFields === undefined) {
		throw ("No 'keyHashFields' and 'keyHashName' are given.");
	}

	if (contentHashFields) {
		if (contentHashName === undefined || contentHashName === null) {
			throw ("No 'contentHashName' given in the chunk definition, but the 'contentHashFields' are defined");
		}
	}

	if (scopeHashFields) {
		if (scopeHashName === undefined || scopeHashName === null) {
			throw ("No 'scopeHashName' given in the chunk definition, but the 'scopeHashFields' are defined");
		}
	}

	let functions = [];
	// create the key hash functions
	functions.push(createHashFunction(keyHashFields, keyHashName));

	// create the content hash functions
	if (contentHashFields && contentHashFields.length > 0) {
		functions.push(createHashFunction(contentHashFields, contentHashName));
	}

	// create the scope hash functions
	if (scopeHashFields && scopeHashFields.length > 0) {
		functions.push(createHashFunction(scopeHashFields, scopeHashName));
	}

	return functions;
}

/**
 * Creates a function which generates a hash from the given content and stores the generated Hash under the given name in the record
 * @param hashFields All the field names used to create the hash
 * @param hashName The name to be used to store the hash value back in the record
 */
function createHashFunction(hashFields, hashName) {

	/**
	 * The function gerates the hash for the given record
	 * @param record The record to create the hash for
	 */
	return function (record) {
		// an array to store all the key field values

		const hashFieldValues = [];

		for (let i = 0; i < hashFields.length; i++) {
			let val = record[hashFields[i]];
			if (val === undefined) {
				val = '';
			}
			hashFieldValues.push(val);
		}

		const valueString = hashFieldValues.join('|');
		const hash = md5(valueString);

		record[hashName] = hash;

		return;

	};
}

export {
	createFunctions,
	createHashFunction
};
