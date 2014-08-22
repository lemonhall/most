/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('../promises');
var asap = require('../asap');

var when = promise.when;

exports.observe = observe;

/**
 * Observe all items in stream
 * @param {function(*):undefined|Promise} f function which will be called
 *  for each item in the stream.  It may return a promise to exert a simple
 *  form of back pressure: f is guaranteed not to receive the next item in
 *  the stream before the promise fulfills.  Returning a non-promise has no
 *  effect on back pressure
 * @param {Stream} stream stream to observe
 * @returns {Promise} promise that fulfills after all items have been observed,
 *  and the stream has ended.
 */
function observe(f, stream) {
	return asap(runStream, f, stream.step, stream.state);
}

function runStream(f, stepper, state) {
	return when(function (s) {
		if (s.done) {
			return s.dispose();
		}

		return when(function () {
			return runStream(f, stepper, s.state);
		}, f(s.value));
	}, when(stepper, state));
}