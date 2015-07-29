var secureRandom = require("secure-random");
var WixAuth = require("wix-auth-hmac");
var HMACAuthRequest = WixAuth.HMACAuthRequest;
var Q = require("q");
var mediaHttp = require("./mediaHttp.js");


var WIX_NONCE = 'x-wix-auth-nonce';
var WIX_TS = 'x-wix-auth-ts';
var HEADER_KEY = "Authorization";
var PROVISION_PATH = '/users/checkin';

function nonce() {
	return secureRandom(6, {type: 'Buffer'}).toString('hex');
}

function utc() {
	return new Date().toISOString();
}

function MediaHMACRequest(verb, config) {
	this.config = config;
	HMACAuthRequest.call(this, config.url, verb, config.path, config.secretKey);
	this.options(WixAuth.Options.HMAC_SCHEMA,  WixAuth.Algorithms.SHA256);
	this.options(WixAuth.Options.PATH_PRIORITY,  true);
	this.options(WixAuth.Options.TRAILING_NEWLINE,  false);
	this.options(WixAuth.Options.WITH_PARAM_VALUES,  true);
	this.options(WixAuth.Options.WEBSAFE_B64, true);
	this.options(WixAuth.Options.PAD_B64, true);
	this.asHeaders("x-wix-");
	this.withHeader(WIX_NONCE, nonce());
	this.withHeader(WIX_TS, utc());
	this.apiKey = this.config.idKey;
}

MediaHMACRequest.prototype = HMACAuthRequest.prototype;

MediaHMACRequest.prototype.toRequestAuth = function(signature) {
	return this.config.serviceName + " " + this.apiKey + ":" + signature;
};

function AuthClient(config) {
	var c = config.toConfig();
	if(!c.validate()) {
		throw 'Bad config';
	}
	this.config = config.toConfig();
	this.authToken = null;
	this.authPromise = null;
}

AuthClient.prototype.getAuthToken = function(callback) {
	var deferred = Q.defer();
	var that = this;
	if(this.authToken !== null) {
		if (typeof callback === "function") {
			callback(null, this.authToken);
		}
		deferred.resolve(this.authToken);
	} else {
		//[dz] avoid sending multiple auth requests
		if(this.authPromise !== null) {
			if (typeof callback === "function") {
				callback(null, this.authPromise);
			}
			return this.authPromise;
		}
		this.authPromise = deferred.promise;
		var apiRequest = new MediaHMACRequest( "GET", this.config);
		var options = apiRequest.toHttpsOptions(HEADER_KEY);
		mediaHttp.request(options).then(function(data) {
			if(typeof data.data !== 'object') {
				var errorString = "Bad authorization";
				if (typeof callback === "function") {
					callback(errorString, null);
				}
				deferred.reject(errorString);
			} else {
				that.authToken = data.data.token;
				that.authScheme = data.data.scheme;
				that.authPromise = null;
				if (typeof callback === "function") {
					callback(null, that.authToken);
				}
				deferred.resolve(that.authToken);
			}
		}, function(error) {
			that.authPromise = null;
			var e2 = "Bad authorization :" + JSON.stringify(error);
			if (typeof callback === "function") {
				callback(e2, null);
			}
			deferred.reject(e2);
		});
	}
	if(typeof callback === "function") {
		var ref = setInterval(function() {
			if(deferred.promise.isFulfilled() || deferred.promise.isRejected()) {
				clearInterval(ref);
				return;
			}
		}, 100);
	} else {
		return deferred.promise;
	}
};

AuthClient.prototype.getAuthHeaders = function(authToken) {
	return {
		'Authorization' : this.authScheme + ' ' + authToken || this.authToken
	};
};

AuthClient.prototype.provision = function(callback) {
	var deferred = Q.defer();
	var that = this;
	this.getAuthToken().then(function(authToken) {
		var options = {
			headers : that.getAuthHeaders(authToken),
			path : PROVISION_PATH,
			host : that.config.url
		};
		mediaHttp.request(options).then(function(data) {
			deferred.resolve();
			if (typeof callback === "function") {
				callback(null, null);
			}
		}, function(error) {
			if (typeof callback === "function") {
				callback('Provision failed: ' + error, null);
			}
			deferred.reject(error);
		});
	}, function(error) {
		if (typeof callback === "function") {
			callback('Provision failed: ' + error, null);
		}
		deferred.reject(error);
	});
	if(typeof callback === "function") {
		var ref = setInterval(function() {
			if(deferred.promise.isFulfilled() || deferred.promise.isRejected()) {
				clearInterval(ref);
				return;
			}
		}, 100);
	} else {
		return deferred.promise;
	}
};

module.exports = AuthClient;