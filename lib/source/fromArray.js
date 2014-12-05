/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var resolve = require('../Promise').resolve;

exports.fromArray = fromArray;

function fromArray (a) {
	return new Stream(new ArraySource(a));
}

function ArraySource(a) {
	this.array = a;
}

ArraySource.prototype.run = function(sink) {
	return new ArrayProducer(this.array, sink);
};

function ArrayProducer(array, sink) {
	this.array = array;
	this.sink = sink;
	this.active = true;
	var self = this;
	resolve(this).then(runProducer).catch(function(e) {
		propagateErrorIfActive(self, e);
	});
}

ArrayProducer.prototype.dispose = function() {
	this.active = false;
};

function runProducer(producer) {
	var a = producer.array;
	var sink = producer.sink;

	for(var i=0; i<a.length && producer.active; ++i) {
		sink.event(0, a[i]);
	}

	producer.active && sink.end(0);
}

function propagateErrorIfActive(producer, e) {
	if(!producer.active) {
		return;
	}
	producer.sink.error(0, e);
}