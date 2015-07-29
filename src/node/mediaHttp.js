var Q = require("q");
var rest = require("restler");

module.exports = {
	request : function(options) {
		"use strict";
		var deferred = Q.defer();
		rest.get('http://' + options.host + options.path,
			{
				headers : options.headers
			}
		).on('complete', function(data, response) {
				if(response.statusCode !== 200) {
					deferred.reject(data);
				} else {
					deferred.resolve({data : data, response : response });
				}
			}).on('error', function(data) {
				deferred.reject(data);
			});
		return deferred.promise;
	}
};