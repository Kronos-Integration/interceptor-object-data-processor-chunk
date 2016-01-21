/*global describe, it*/
/* jslint node: true, esnext: true */
"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const cloneDeep = require('clone-deep');
const mockReadStream = require('./mockReadStream');
const chunkProcessor = require('../lib/data-processor-chunk.js');

const objData = require('./fixtures/data.json');

const chunkDefinitionGroupFrinds = {
	"keyHashFields": ["first", "last"],
	"keyHashName": "__key",
	"contentHashFields": ["first", "last", "friends"],
	"contentHashName": "__content",
	"scopeHashFields": ["street"],
	"scopeHashName": "__scope",
	"multiRowFields": ["friends"]
};

const chunkDefinitionNoGroup = {
	"keyHashFields": ["first", "last"],
	"keyHashName": "__key",
	"contentHashFields": ["friends", "street"],
	"contentHashName": "__content"
};


describe("data-processor-chunk", function () {

	it('Group the friends', function (done) {

		let testObjects = objects2StreamData(cloneDeep(objData.values));

		collect(testObjects, verify, chunkDefinitionGroupFrinds);

		function verify(err, objects) {
			assert.notOk(err);
			assert.equal(objects.length, 4);

			assert.deepEqual(objects, [{
				lineNumber: 1,
				data: {
					first: 'Foo',
					last: 'bar',
					street: 'one way street',
					friends: 'herbert',
					__key: '442f5364306d1ca394b4e0bdf08d51c9',
					__content: 'ee3225f4ede779794275a2281b2f940b',
					__scope: '390aa8a106dab6cd16b97c208da61b92',
					__TMP_HASH_FIELD__: '442f5364306d1ca394b4e0bdf08d51c9'
				}
			}, {
				lineNumber: 2,
				data: {
					first: 'Herbert',
					last: 'Batz',
					street: 'one way street',
					friends: 'joe',
					__key: '4fc93d122437e667aa12aa45b06c5609',
					__content: '7bbb39fc2f0fa8b933070bf1fd456b89',
					__scope: '390aa8a106dab6cd16b97c208da61b92',
					__TMP_HASH_FIELD__: '4fc93d122437e667aa12aa45b06c5609'
				}
			}, {
				lineNumber: 3,
				data: {
					first: 'Kuni',
					last: 'Bert',
					street: 'second way street',
					friends: ["ali", "Herbert"],
					__key: 'f5cfc2b6a18bd84dc21552770146c698',
					__content: 'e18768165230211c3b392440ed56ffc9',
					__scope: '395e6f9487247e85c36151bbbff852c0',
					__TMP_HASH_FIELD__: 'f5cfc2b6a18bd84dc21552770146c698'
				}
			}, {
				lineNumber: 5,
				data: {
					first: 'Franz',
					last: 'Kanz',
					street: 'second way street',
					friends: 'Foo',
					__key: 'd952800a159ee343e8dc1afefe1103d5',
					__content: '98d40cdf1acb4c08935a1a8d28e6d5b1',
					__scope: '395e6f9487247e85c36151bbbff852c0',
					__TMP_HASH_FIELD__: 'd952800a159ee343e8dc1afefe1103d5'
				}
			}]);
			done();
		}
	});


	it('No grouping', function (done) {

		let testObjects = objects2StreamData(cloneDeep(objData.values));

		collect(testObjects, verify, chunkDefinitionNoGroup);

		function verify(err, objects) {
			assert.notOk(err);
			assert.equal(objects.length, 5);

			assert.deepEqual(objects, [{
				lineNumber: 1,
				data: {
					first: 'Foo',
					last: 'bar',
					street: 'one way street',
					friends: 'herbert',
					__key: '442f5364306d1ca394b4e0bdf08d51c9',
					__content: 'abf5c69b5128d6ef8a1ccbaf0ad496da'
				}
			}, {
				lineNumber: 2,
				data: {
					first: 'Herbert',
					last: 'Batz',
					street: 'one way street',
					friends: 'joe',
					__key: '4fc93d122437e667aa12aa45b06c5609',
					__content: '42ce23b9972543efed1bad454f012d83'
				}
			}, {
				lineNumber: 3,
				data: {
					first: 'Kuni',
					last: 'Bert',
					street: 'second way street',
					friends: "ali",
					__key: 'f5cfc2b6a18bd84dc21552770146c698',
					__content: '1a83298c2a7ded6f701f775b328534ea'
				}
			}, {
				lineNumber: 4,
				data: {
					first: 'Kuni',
					last: 'Bert',
					street: 'second way street',
					friends: 'Herbert',
					__key: 'f5cfc2b6a18bd84dc21552770146c698',
					__content: 'e2166e80781c798a9aac7ca9ed321879'
				},
				"error": [{
					"doubleLines": [
						3,
						4
					],
					"errorCode": "DOUBLE_KEY_DIFFERENT_DATA",
					"lineNumber": 4,
					"severity": "skip_row"
				}]
			}, {
				lineNumber: 5,
				data: {
					first: 'Franz',
					last: 'Kanz',
					street: 'second way street',
					friends: 'Foo',
					__key: 'd952800a159ee343e8dc1afefe1103d5',
					__content: '88d670329afc250cc5c7fd429e63d309'
				}
			}]);
			done();
		}
	});

});

/**
 * Converst the object data to the format used in the stream
 */
function objects2StreamData(objects) {
	if (!Array.isArray(objects)) {
		let tmpVal = objects;
		objects = [];
		objects.push(tmpVal);
	}

	let newData = [];
	for (let i = 0; i < objects.length; i++) {
		newData.push({
			"lineNumber": i + 1,
			"data": objects[i]
		});
	}

	return newData;
}

function collect(objects, verifyFunction, opts) {
	let dummyStream = mockReadStream();
	dummyStream.add(objects);

	let lines = [];

	let cp = chunkProcessor(opts);
	dummyStream.pipe(cp).on('data', function (line) {
			lines.push(line);
		})
		.on('error', function (err) {
			verifyFunction(err, lines);
		})
		.on('header', function (header) {
			//console.log(header);
		})
		.on('end', function () {
			verifyFunction(false, lines);
		});

}
