var Promise = require("bluebird");
var rest = require("restler");

module.exports = {
	request : function(options) {
		"use strict";
		return new Promise(function (resolve, reject) {
			rest.get('http://' + options.host + options.path,
				{
					headers : options.headers
				}
			).on('complete', function(data, response) {
					if(response.statusCode !== 200) {
						reject(data);
					} else {
						resolve({data : data, response : response });
					}
				}).on('error', function(data) {
					reject(data);
				});
		});
	}
};