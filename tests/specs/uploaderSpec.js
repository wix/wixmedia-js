var wms = require('../../src/wixmedia');
var expect = require('expect.js');


describe('Test Wix Uploader', function () {
	it('should be created from secret and apiKey', function () {
		try {
			var uploader = wms.uploader('a', 'b');
			expect(true).to.be(true);
		} catch(e) {
			expect(false).to.be(true);
		}
	});

	it('should be created', function () {
		try {
			wms.uploader(wms.auth.config(wms.auth.modes.WIX).secretKey('a').apiKey('b'));
			expect(true).to.be(true);
		} catch(e) {
			expect(false).to.be(true);
		}
	});
});
