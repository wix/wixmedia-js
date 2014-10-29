var Q = require("q");
var WixAuth = require("wix-auth-hmac");
var HMACAuthRequest = WixAuth.HMACAuthRequest;
var rest = require("restler");
var secureRandom = require("secure-random");
var FS = require('fs');

var METADATA_SERVICE_HOST = 'mediacloud.wix.com';
var WIX_MEDIA_UPLOAD_URL_PATH = '/files/upload/url';
var AUTH_URL_PATH = '/auth/get-token';
var WIX_NONCE = 'x-wix-upload-nonce';
var WIX_TS = 'x-wix-upload-ts';
var HEADER_KEY = "Authorization";
var WIX_AUTH_SERVICE  = "WIX";
var AUTH_ALGORITHM = 'MCLOUDTOKEN';

function nonce() {
	return secureRandom(6, {type: 'Buffer'}).toString('hex');
}

function utc() {
	return Math.floor(new Date().getTime() / 1000);
}

function MediaHMACRequest(url, verb, path, apiKey, secretKey) {
	HMACAuthRequest.call(this, url, verb, path, secretKey);
	this.options(WixAuth.Options.HMAC_SCHEMA,  WixAuth.Algorithms.SHA256);
	this.options(WixAuth.Options.PATH_PRIORITY,  true);
	this.options(WixAuth.Options.TRAILING_NEWLINE,  true);
	this.options(WixAuth.Options.WITH_PARAM_VALUES,  true);
	this.options(WixAuth.Options.WEBSAFE_B64, false);
	this.asHeaders("x-wix-");
	this.withHeader(WIX_NONCE, nonce());
	this.withHeader(WIX_TS, utc());
	this.apiKey = apiKey;
}

MediaHMACRequest.prototype = HMACAuthRequest.prototype;

MediaHMACRequest.prototype.toRequestAuth = function(signature) {
	return WIX_AUTH_SERVICE + " " + this.apiKey + ":" + signature;
};

function UploadClient(apiKey, secretKey) {
	this.apiKey = apiKey;
	this.secretKey = secretKey;
	this.authToken = null;
	this.authPromise = null;
}

UploadClient.prototype.request = function(options) {
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
};

UploadClient.prototype.getAuthToken = function() {
	var deferred = Q.defer();
	if(this.authToken !== null) {
		deferred.resolve(this.authToken);
	} else {
		//[dz] avoid sending multiple auth requests
		if(this.authPromise !== null) {
			return this.authPromise;
		}
		this.authPromise = deferred.promise;
		var apiRequest = new MediaHMACRequest(METADATA_SERVICE_HOST, "GET", AUTH_URL_PATH, this.apiKey, this.secretKey);
		var options = apiRequest.toHttpsOptions(HEADER_KEY);
		this.request(options).then(function(data) {
			var key = data.response.headers[HEADER_KEY.toLowerCase()];
			if(key === undefined) {
				deferred.reject("Bad authorization");
			} else {
				var pieces = key.split(' ');
				if(pieces[0] !== AUTH_ALGORITHM) {
					deferred.reject(null);
				}
				this.authToken = pieces[1];
				this.authPromise = null;
				deferred.resolve(this.authToken);
			}
		}, function(error) {
			this.authPromise = null;
			deferred.reject("Bad authorization :" + JSON.stringify(error));
		});
	}
	return deferred.promise;
};

function getAuthHeaders(authToken) {
	return {
		'Authorization' : AUTH_ALGORITHM + ' ' + authToken
	};
}

UploadClient.prototype.getUploadUrl = function() {
	var deferred = Q.defer();
	var that = this;
	this.getAuthToken().then(function(authToken) {
		var options = {
			headers : getAuthHeaders(authToken),
			path : WIX_MEDIA_UPLOAD_URL_PATH,
			host : METADATA_SERVICE_HOST
		};
		that.request(options).then(function(data) {
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
	this.getUploadUrl().then(function(uploadUrl) {
		Q.nfcall(FS.stat, path).then(function(stats) {
			rest.post(uploadUrl, {
				multipart: true,
				headers : getAuthHeaders(this.authToken),
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