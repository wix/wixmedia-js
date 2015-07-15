var wms = require('../../src/wixmedia');
var expect = require('expect.js');


describe('Test Wix Auth Client Config', function () {
	it('wix auth config should be invalid', function () {
		var config = wms.auth.config(wms.auth.modes.WIX);
		expect(config.toConfig().validate()).to.be(false);
	});

	it('wix auth config should be invalid', function () {
		var config = wms.auth.config(wms.auth.modes.WIX);
		config.secretKey('');
		expect(config.toConfig().validate()).to.be(false);
	});

	it('wix auth config should be valid', function () {
		var config = wms.auth.config(wms.auth.modes.WIX);
		config.secretKey('').apiKey('');
		expect(config.toConfig().validate()).to.be(true);
	});

	it('wix auth config should have correct properties', function () {
		var config = wms.auth.config(wms.auth.modes.WIX);
		config.secretKey('').apiKey('');
		expect(config.toConfig().path).to.be('/auth/token');
		expect(config.toConfig().serviceName).to.be('WIX');
	});

	it('tenant auth config should be invalid', function () {
		var config = wms.auth.config(wms.auth.modes.TENANT);
		expect(config.toConfig().validate()).to.be(false);
	});

	it('tenant auth config should be invalid', function () {
		var config = wms.auth.config(wms.auth.modes.TENANT);
		config.secretKey('');
		expect(config.toConfig().validate()).to.be(false);
	});

	it('tenant auth config should be valid', function () {
		var config = wms.auth.config(wms.auth.modes.TENANT);
		config.secretKey('').tenantKey('');
		expect(config.toConfig().validate()).to.be(true);
	});

	it('tenant auth config should have correct properties', function () {
		var config = wms.auth.config(wms.auth.modes.TENANT);
		config.secretKey('').tenantKey('');
		expect(config.toConfig().path).to.be('/auth/tenant/token');
		expect(config.toConfig().serviceName).to.be('WIXTENANT');
	});
});


describe('Test Wix Auth Client from config', function () {

	it('wix auth client should be valid', function () {
		var config = wms.auth.config(wms.auth.modes.WIX);
		config.secretKey('').apiKey('');
		try {
			wms.auth.client(config);
			expect(true).to.be(true);
		} catch(e) {
			expect(false).to.be(true);
		}
	});

	it('tenant auth client should be valid', function () {
		var config = wms.auth.config(wms.auth.modes.TENANT);
		config.secretKey('').tenantKey('');
		try {
			wms.auth.client(config);
			expect(true).to.be(true);
		} catch(e) {
			expect(false).to.be(true);
		}
	});
});
