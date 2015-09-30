/*global require, describe, it*/
/* jslint node: true, esnext: true */
"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const _ = require('underscore');

const dataHashFactory = require('../lib/data-hash').createFunctions;

const distinctData = require('./fixtures/distinct_data.json');


const chunkDefinition = {
	"keyFields": ["first", "last"],
	"keyHashName": "__key",
	"contentHashFields": ["first", "last", "friends"],
	"contentHashName": "__content",
	"scopeHashFields": ["street"],
	"scopeHashName": "__scope",
	"multiRowFields": ["friends"]
};

const chunkDefinition_without_scope = {
	"keyFields": ["first", "last"],
	"keyHashName": "__key",
	"contentHashFields": ["first", "last", "friends"],
	"contentHashName": "__content",
	"multiRowFields": ["friends"]
};

const chunkDefinition_keyOnly = {
	"keyFields": ["first", "last"],
	"keyHashName": "__key"
};


describe("data-processor-chunk:data-hash - Errors", function () {


	it("No valid data at all", function (done) {
		let error;
		try {
			dataHashFactory({
				"data_": "huhu"
			});
			error = "Should never reach this";
		} catch (err) {
			error = err;
		}
		assert.equal(error, "No 'keyHashFields' and 'keyHashName' are given.");
		done();
	});

	it("KeyField given, but no hash name", function (done) {
		let error;
		try {
			dataHashFactory({
				"keyFields": ["first", "last"],
				"keyHash_Name": "__key"
			});
			error = "Should never reach this";
		} catch (err) {
			error = err;
		}
		assert.equal(error, "No 'keyHashFields' and 'keyHashName' are given.");
		done();
	});

	it("ContentHashFields given, but no hash name", function (done) {
		let error;
		try {
			dataHashFactory({
				"keyFields": ["first", "last"],
				"keyHashName": "__key",
				"contentHashFields": ["last"]
			});
			error = "Should never reach this";
		} catch (err) {
			error = err;
		}
		assert.equal(error, "No 'contentHashName' given in the chunk definition, but the 'contentHashFields' are defined");
		done();
	});

	it("ScopeHashFields given, but no hash name", function (done) {
		let error;
		try {
			dataHashFactory({
				"keyFields": ["first", "last"],
				"keyHashName": "__key",
				"scopeHashFields": ["last"]
			});
			error = "Should never reach this";
		} catch (err) {
			error = err;
		}
		assert.equal(error, "No 'scopeHashName' given in the chunk definition, but the 'scopeHashFields' are defined");
		done();
	});


});


describe("data-processor-chunk:data-hash - key fields only", function () {
	const functions = dataHashFactory(chunkDefinition_keyOnly);

	it("One functions are expected", function () {
		functions.length.should.equal(1);
	});

	it("Test key hash creation", function () {
		// the first function is for the key hash

		distinctData.values.forEach(function (item, idx, arr) {
			functions[0](item);
		});

		// check that there is a key hash for each record
		distinctData.values.forEach(function (item, idx, arr) {
			should.exist(item.__key);
		});
	});
});



describe("data-processor-chunk:data-hash - without scope", function () {
	const functions = dataHashFactory(chunkDefinition_without_scope);

	it("Two functions are expected", function () {
		functions.length.should.equal(2);
	});

	it("Test key hash creation", function () {
		// the first function is for the key hash

		distinctData.values.forEach(function (item, idx, arr) {
			functions[0](item);
		});

		// check that there is a key hash for each record
		distinctData.values.forEach(function (item, idx, arr) {
			should.exist(item.__key);
		});
	});

	it("Test content hash creation", function () {
		// the first function is for the key hash

		distinctData.values.forEach(function (item, idx, arr) {
			functions[1](item);
		});

		// check that there is a key hash for each record
		distinctData.values.forEach(function (item, idx, arr) {
			should.exist(item.__content);
		});
	});
});
