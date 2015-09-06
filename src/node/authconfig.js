/**
 * @summary Authentication modes
 * @enum {String}
 * @readonly
 * @alias Modes
 * @memberof auth
 */
var Modes = {
	WIX : 'WIX',
	TENANT : 'TENANT'
};

/**
 * @summary An AuthConfig for use with an AuthClient
 * @constructor
 * @memberof auth
 */
function AuthConfig(path, serviceName, idKey, secretKey, url) {
	this.path = path;
	this.serviceName = serviceName;
	this.idKey = idKey;
	this.secretKey = secretKey;
	this.url = url;
}

AuthConfig.prototype.validate = function() {
	if(this.idKey === null) {
		return false;
	}

	if(this.secretKey === null) {
		return false;
	}
	return true;
};

/**
 * @summary the standard config used to authenticate against WixMP
 * @constructor
 * @memberof auth
 */
function WixConfig() {
	this.secret = null;
	this.api = null;
	this.mode = Modes.WIX;
	this.path = '/auth/token';
	this.serviceName = 'WIX';
}

/**
 * @summary Sets your secret key
 * @param secret {String} A secret key
 * @returns {auth.WixConfig} A config for Wix
 */
WixConfig.prototype.secretKey = function(secret) {
	this.secret = secret;
	return this;
};

/**
 * @summary Sets your API key
 * @param secret {String} A API key
 * @returns {auth.WixConfig} A config for Wix
 */
WixConfig.prototype.apiKey = function(apiKey) {
	this.api = apiKey;
	return this;
};

/**
 * @summary Creates an AuthConfig to use with uploading files to Wix
 * @returns {auth.AuthConfig}
 */
WixConfig.prototype.toConfig = function() {
	return new AuthConfig(this.path, this.serviceName, this.api, this.secret, 'mediacloud.wix.com');
};

/**
 * @summary the config used to authenticate against WixMP as a tenant
 * @constructor
 * @memberof auth
 */
function TenantConfig() {
	this.secret = null;
	this.key = null;
	this.mode = Modes.TENANT;
	this.path = '/auth/tenant/token';
	this.serviceName = 'WIXTENANT';
	this.url = null;
}

/**
 * @summary Sets your secret key
 * @param secret {String} A secret key
 * @returns {auth.TenantConfig} A config for a tenant
 */
TenantConfig.prototype.secretKey = function(secret) {
	this.secret = secret;
	return this;
};

/**
 * @summary Sets your tenant user ID
 * @param key {String} The user iD
 * @returns {auth.TenantConfig} A config for a tenant
 */
TenantConfig.prototype.userId = function(key) {
	this.key = key;
	return this;
};

/**
 * @summary Sets your tenant's endpoint URL
 * @param url {String} The endpoint URL
 * @returns {auth.TenantConfig} A config for a tenant
 */
TenantConfig.prototype.endpointUrl = function(url) {
	this.url = url;
	return this;
};

/**
 * @summary Creates an AuthConfig to use with uploading files to Wix
 * @returns {auth.AuthConfig}
 */
TenantConfig.prototype.toConfig = function() {
	return new AuthConfig(this.path, this.serviceName, this.key, this.secret, this.url);
};

module.exports = {

	/**
	 * @summary Creates an {AuthConfig} for either WixMP or tenant mode
	 * @param {Modes} mode The authentication mode. Defaults to `WIX`
	 * @returns {*}
	 */
	authConfig : function(mode) {
		if (mode === Modes.WIX) {
			return new WixConfig();
		} else if(mode === Modes.TENANT) {
			return new TenantConfig();
		}
		throw 'Bad mode';
	},
	/**
	 * @summary Authentication modes
	 * @type {Modes}
	 */
	AuthModes : Modes
};

