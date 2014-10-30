var secureRandom = require("secure-random");
var WixAuth = require("wix-auth-hmac");
var HMACAuthRequest = WixAuth.HMACAuthRequest;
var Q = require("q");
var mediaHttp = require("./mediaHttp.js");

var AUTH_URL_PATH = '/auth/get-token';
var WIX_NONCE = 'x-wix-auth-nonce';
var WIX_TS = 'x-wix-auth-ts';
var HEADER_KEY = "Authorization";
var WIX_AUTH_SERVICE  = "WIX";
var AUTH_ALGORITHM = 'MCLOUDTOKEN';

function nonce() {
	return secureRandom(6, {type: 'Buffer'}).toString('hex');
}

function utc() {
	return new Date().toISOString();
}

function MediaHMACRequest(url, verb, apiKey, secretKey) {
	HMACAuthRequest.call(this, url, verb, AUTH_URL_PATH, secretKey);
	this.options(WixAuth.Options.HMAC_SCHEMA,  WixAuth.Algorithms.SHA256);
	this.options(WixAuth.Options.PATH_PRIORITY,  true);
	this.options(WixAuth.Options.TRAILING_NEWLINE,  false);
	this.options(WixAuth.Options.WITH_PARAM_VALUES,  true);
	this.options(WixAuth.Options.WEBSAFE_B64, true);
	this.options(WixAuth.Options.PAD_B64, true);
	this.asHeaders("x-wix-");
	this.withHeader(WIX_NONCE, nonce());
	this.withHeader(WIX_TS, utc());
	this.apiKey = apiKey;
}

MediaHMACRequest.prototype = HMACAuthRequest.prototype;

MediaHMACRequest.prototype.toRequestAuth = function(signature) {
	return WIX_AUTH_SERVICE + " " + this.apiKey + ":" + signature;
};

function AuthClient(apiKey, secretKey) {
	this.apiKey = apiKey;
	this.secretKey = secretKey;
	this.authToken = null;
	this.authPromise = null;
}

AuthClient.prototype.getAuthToken = function() {
	var deferred = Q.defer();
	if(this.authToken !== null) {
		deferred.resolve(this.authToken);
	} else {
		//[dz] avoid sending multiple auth requests
		if(this.authPromise !== null) {
			return this.authPromise;
		}
		this.authPromise = deferred.promise;
		var apiRequest = new MediaHMACRequest(mediaHttp.CLOUD_URL, "GET", this.apiKey, this.secretKey);
		var options = apiRequest.toHttpsOptions(HEADER_KEY);
		mediaHttp.request(options).then(function(data) {
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

AuthClient.prototype.getAuthHeaders = function(authToken) {
	return {
		'Authorization' : AUTH_ALGORITHM + ' ' + authToken || this.authToken
	};
};

module.exports = AuthClient;