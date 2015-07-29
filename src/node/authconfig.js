var Modes = {
	WIX : 'WIX',
	TENANT : 'TENANT'
};

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

function WixConfig() {
	this.secret = null;
	this.api = null;
	this.mode = Modes.WIX;
	this.path = '/auth/token';
	this.serviceName = 'WIX';
}

WixConfig.prototype.secretKey = function(secret) {
	this.secret = secret;
	return this;
};

WixConfig.prototype.apiKey = function(apiKey) {
	this.api = apiKey;
	return this;
};

WixConfig.prototype.toConfig = function() {
	return new AuthConfig(this.path, this.serviceName, this.api, this.secret, 'mediacloud.wix.com');
};

function TenantConfig() {
	this.secret = null;
	this.key = null;
	this.mode = Modes.TENANT;
	this.path = '/auth/tenant/token';
	this.serviceName = 'WIXTENANT';
	this.url = null;
}

TenantConfig.prototype.secretKey = function(secret) {
	this.secret = secret;
	return this;
};

TenantConfig.prototype.userId = function(key) {
	this.key = key;
	return this;
};

TenantConfig.prototype.endpointUrl = function(url) {
	this.url = url;
	return this;
};

TenantConfig.prototype.toConfig = function() {
	return new AuthConfig(this.path, this.serviceName, this.key, this.secret, this.url);
};

module.exports = {
	authConfig : function(mode) {
		if (mode === Modes.WIX) {
			return new WixConfig();
		} else if(mode === Modes.TENANT) {
			return new TenantConfig();
		}
		throw 'Bad mode';
	},
	AuthModes : Modes
};

