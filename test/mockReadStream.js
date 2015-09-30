/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const stream = require('stream');


class MockReadStream extends stream.Readable {
	constructor() {
		super({
			objectMode: true,
			highWaterMark: 16
		});

		// Stores the objects to be readable
		this.objectStack = [];
	}

	add(obj) {
		if (Array.isArray(obj)) {
			this.objectStack = obj;
		} else {
			this.objectStack.push(obj);
		}
	}

	_read() {
		if (this.objectStack.length > 0) {
			this.push(this.objectStack.shift());
		} else {
			this.push(null);
		}
	}
}
module.exports = function () {
	return new MockReadStream();
};
