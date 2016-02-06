/* jslint node: true, esnext: true */
"use strict";

/**
 * This module will turn an array of tokens into an object.
 */

const stream = require('stream');

const ZSchema = require("z-schema");
const validator = new ZSchema({});
const schema = require("../schema/chunk.json");

const hashFactory = require('./data-hash');

const ERR_DOUBLE_KEY = "DOUBLE_KEY";
const ERR_DOUBLE_KEY_SAME = "DOUBLE_KEY_SAME_DATA";
const ERR_DOUBLE_KEY_DIFF = "DOUBLE_KEY_DIFFERENT_DATA";



// The name used to store the has for the content without the
// multi row fields
var TMP_HASH_FIELD_NAME = '__TMP_HASH_FIELD__';

class DataProcessorChunk extends stream.Transform {

	/**
	 *
	 * @oaram opts The field definitions as decribed by the schema
	 * @validate if is true, then the given options will be validated by the schema
	 */
	constructor(opts, validate) {
		// call the constructor of stream.Transform
		super({
			objectMode: true,
			highWaterMark: 16
		});

		if (!opts) opts = {};

		if (validate) {
			// first check if the checkProperty is valid
			const valid = validator.validate(opts, schema);
			const validationErrors = validator.getLastErrors();

			if (validationErrors) {
				// There where validation errors
				throw new Error(validationErrors);
			}

		}

		if (opts.multiRowFields !== undefined) {
			// This data could have many rows with the sam ekey fields.
			// In this case the data of the multirow fields needs to be aggregated

			if (Array.isArray(opts.multiRowFields)) {
				if (opts.multiRowFields.length > 0) {
					this.multiRowFields = opts.multiRowFields;
				}
			} else {
				throw new Error("The field 'multiRowFields' must be an array.");
			}
		}



		// Stores all the checks/action to be executed
		this.rowActions = hashFactory.createFunctions(opts);

		// if there are multirows we need a second content hash without the multi row fields
		if (this.multiRowFields && opts.contentHashFields !== undefined) {
			let tmpHashAction = createTmpHashAction(opts.contentHashFields, this.multiRowFields);
			if (tmpHashAction) {
				this.rowActions.push(tmpHashAction);
			}
		}

		// get the severties for the double line checks and so on.
		if (opts.checks) {
			if (opts.checks.double_rows_same) {
				// there was a double row delivery but is a complete copy
				this.doubleKeySameContent = opts.checks.double_rows_same;
			}

			if (opts.checks.double_rows_different) {
				// there was a double row (same key) but different content
				this.doubleKeyDifferenContent = opts.checks.double_rows_different;
			}
		}

		// set the default values
		if (!this.double_rows_same) {
			this.doubleKeySameContent = 'skip_row';
		}
		if (!this.doubleKeyDifferenContent) {
			this.doubleKeyDifferenContent = 'skip_row';
		}


		this.keyHashName = opts.keyHashName;
		this.contentHashName = opts.contentHashName;
		this.scopeHashName = opts.scopeHashName;

		// used to store the content
		// only used if this.multiRowFields
		// this.contentStore[key] = [row1, row2];
		// row is the complete data object
		this.contentStore = {};

		// used to store the keys in the order they come in
		// to push them in the same order out again
		this.lineOrderStore = [];

		// used to store the row keys and there line number.
		// used to find duplicate lines
		// this.keyStore[key].lineNumbers = [1, 15, 19];
		// this.keyStore[key].contentHash = firstHash
		this.keyStore = {};
	}

	/**
	 * Add custom actions to the rowActions.
	 * These actions will be executed per row
	 */
	addRowActions(actions) {
		if (actions) {
			if (Array.isArray(actions)) {
				for (let i = 0; i < actions.length; i++) {
					this.rowAction.push(actions[i]);
				}
			} else {
				this.rowAction.push(actions);
			}
		}
	}

	/**
	 * Reads the stream data and split it into lines.
	 */
	_transform(data, enc, cb) {
			if (data.lineNumber === 0) {
				if (data.header) {
					// If the first element is a header. Skip it
					cb(data);
				}
			}

			let row = data.data;

			for (let i = 0; i < this.rowActions.length; i++) {
				this.rowActions[i](row);
			}

			const key = row[this.keyHashName];
			const lineNumber = data.lineNumber;


			if (this.multiRowFields) {
				// In this case we need to store all the data because we may need to aggregate them.

				/*
				 * Structure of the store for multi rows
				 * this.contentStore[key] = [row1, row2];
				 * stores all the rows with the same key
				 */
				if (!this.contentStore[key]) {
					// The first time this key comes up
					this.contentStore[key] = [];
					this.lineOrderStore.push(key);
				}
				// This key was already there
				this.contentStore[key].push(data);

			} else {
				// we only need to store the hashes and the line number for it
				// this.keyStore[key].lineNumbers = [1, 15, 19];
				// this.keyStore[key].contentHash = firstHash
				// we store the content hash also. If the content has is the same it is just a double line
				// and may not such a problem

				if (!this.keyStore[key]) {
					// the first time this key comes up
					this.keyStore[key] = {};
					this.keyStore[key].lineNumber = [];
					this.keyStore[key].lineNumber.push(lineNumber);

				} else {
					this.keyStore[key].lineNumber.push(lineNumber);

					if (this.contentHashName) {
						// we could this check only if we have a content check

						// This key was already there. Need to throw an error
						let lastHash = this.keyStore[key].contentHash;
						if (row[this.contentHashName] === lastHash) {
							// error double key but same content
							addError(data, {
								"errorCode": ERR_DOUBLE_KEY_SAME,
								"severity": this.doubleKeySameContent,
								"doubleLines": this.keyStore[key].lineNumber
							});
						} else {
							// error double key with different content
							addError(data, {
								"errorCode": ERR_DOUBLE_KEY_DIFF,
								"severity": this.doubleKeyDifferenContent,
								"doubleLines": this.keyStore[key].lineNumber
							});
						}
					} else {
						//  error double key
						addError(data, {
							"errorCode": ERR_DOUBLE_KEY,
							"severity": this.doubleKeySameContent,
							"doubleLines": this.keyStore[key].lineNumber
						});
					}
				}

				// No multi row fields, we could push the data right away
				this.push(data);
			}

			cb();
		} // end transform

	/**
	 * Flushes the data.
	 * Only needed if there are multi row fields used
	 */
	_flush(cb) {
		// this.contentStore[key] = [row1, row2];
		if (this.multiRowFields) {
			// Ok, now it is time to create the new row elements and put them on the stream
			for (let i = 0; i < this.lineOrderStore.length; i++) {
				const key = this.lineOrderStore[i];
				const rows = this.contentStore[key];
				if (rows.length == 1) {
					// just send it out
					this.push(rows[0]);
				} else {
					// ok, there are more then one row
					const row1 = rows[0];
					// row1 is the complete data object
					for (let rowNum = 1; rowNum < rows.length; rowNum++) {
						// iterate the rows, then iterate the multirow fields
						for (let fieldNum = 0; fieldNum < this.multiRowFields.length; fieldNum++) {
							const multiRowFieldName = this.multiRowFields[fieldNum];
							if (rowNum == 1) {
								// at the first round we need to make the field an array
								const tmpVal = row1.data[multiRowFieldName];
								row1.data[multiRowFieldName] = [];
								row1.data[multiRowFieldName].push(tmpVal);
							}
							// just push the values from the other row to it
							row1.data[multiRowFieldName].push(rows[rowNum].data[multiRowFieldName]);

							// we need to check that for multiple rows only the multi fields should be different
							if (row1.data[TMP_HASH_FIELD_NAME] !== rows[rowNum].data[TMP_HASH_FIELD_NAME]) {
								// the has for the other field is different. This should not be the case
								addError(rows[rowNum], {
									"errorCode": ERR_DOUBLE_KEY_DIFF,
									"severity": this.doubleKeyDifferenContent,
									"doubleLines": [row1.lineNumber, rows[rowNum].lineNumber]
								});
							}

							if (rows[rowNum].error) {
								// we need also to add the errors
								if (!row1.error) {
									row1.error = [];
								}
								for (let errCount = 0; errCount < rows[rowNum].error.length; errCount++) {
									row1.error.push(rows[rowNum].error[errCount]);
								}
							}
						}
					}

					this.push(row1);
				}
			}
		}

		this.multiRowFields = undefined;
		cb();
	}
}

/**
 * Adds an error to the stream data
 * @param data The current stream data
 * @param error The error to be added.
 */
function addError(data, error) {
	if (!data.error) {
		data.error = [];
	}
	error.lineNumber = data.lineNumber;
	data.error.push(error);
}


/**
 * Creates a hash function to compute a content hash without the multirow fields
 */
function createTmpHashAction(contentHashFields, multiRowFields) {
	let tmpHashFields = [];

	// where there fields from the contentHashFields in the multiRowFields?
	let fieldClash = false;

	// add the original content hash fields to an new array
	// but check that there are not in the multiRowFields.
	for (let i = 0; i < contentHashFields.length; i++) {


		let found = false;
		for (let j = 0; j < multiRowFields.length; j++) {
			if (contentHashFields[i] === multiRowFields[j]) {
				found = true;
				continue;
			}
		}

		if (found) {
			fieldClash = true;
		} else {
			tmpHashFields.push(contentHashFields[i]);
		}
	}

	// now we have a new array
	if (fieldClash) {
		// only in this case we need a separate hash
		return hashFactory.createHashFunction(tmpHashFields, TMP_HASH_FIELD_NAME);
	} else {
		// In this case we could use the normal content hash as the muti row fields where not included
		return;
	}
}

module.exports = function (opts, validate) {
	return new DataProcessorChunk(opts, validate);
};
