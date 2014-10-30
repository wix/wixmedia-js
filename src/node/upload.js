var Q = require("q");
var rest = require("restler");
var FS = require('fs');
var mediaHttp = require("./mediaHttp.js");
var AuthClient = require("./AuthClient.js");


var WIX_MEDIA_UPLOAD_URL_PATH = '/files/upload/url';

function UploadClient(apiKey, secretKey) {
	AuthClient.call(this, apiKey, secretKey);
}

UploadClient.prototype = AuthClient.prototype;

UploadClient.prototype.getUploadUrl = function() {
	var deferred = Q.defer();
	var that = this;
	this.getAuthToken().then(function(authToken) {
		var options = {
			headers : that.getAuthHeaders(authToken),
			path : WIX_MEDIA_UPLOAD_URL_PATH,
			host : mediaHttp.CLOUD_URL
		};
		mediaHttp.request(options).then(function(data) {
			deferred.resolve(data.data.upload_url);
		}, function(error) {
			deferred.reject(error);
		});
	}, function(error) {
		deferred.reject(error);
	});
	return deferred.promise;
};

UploadClient.prototype.upload = function (path, success, failure) {
	var deferred = Q.defer();
	var that = this;
	this.getUploadUrl().then(function(uploadUrl) {
		Q.nfcall(FS.stat, path).then(function(stats) {
			rest.post(uploadUrl, {
				multipart: true,
				headers : that.getAuthHeaders(this.authToken),
				data : {
					"media_type" : "picture",
					"file" : rest.file(path, null, stats.size)
				}

			}).on('complete', function(data) {
				if(typeof success === Function) {
					success(data);
				}
				deferred.resolve(data);
			}).on('error', function(data) {
				deferred.reject(data);
			});
		});

	}, function(error) {
		if(typeof failure === Function) {
			failure(error);
		}
		deferred.reject(error);
	});
	return deferred.promise;
};


module.exports = {
	client : function(apiKey, secretKey) {
		var c = new UploadClient(apiKey, secretKey);
		return {
			uploadFromFile : function(path, success, failure) {
				return c.upload(path, success, failure);
			}
		};
	}
};