/* jslint node: true, esnext: true */
"use strict";

const Interceptor = require('./lib/interceptor').Interceptor;

exports.Interceptor = Interceptor;

exports.registerWithManager = manager => manager.registerInterceptor(Interceptor);
