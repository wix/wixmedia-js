/* jshint ignore:start */
var wms = require('../../src/wixmedia');
var WixImage = wms.WixImage;
var expect = require('expect.js');

describe('Test Wix Media Services', function () {
    it('Test fill construction, w, h, a', function () {
       var i = new WixImage("http://test.wix.com", "12345");
       var url = i.fill().size(100, 300).alignment(wms.Defaults.Alignment.LEFT).name("cat.jpg").toUrl();
       expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,a_l/cat.jpg");
    });
    it('Test fill construction, w, h, a shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().w(100).h(300).alignment(wms.Defaults.Alignment.LEFT).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,a_l/cat.jpg");
    });
    it('Test fill construction, (w, h), q', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300).quality(80).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_80/cat.jpg");
    });
    it('Test fill construction, (w, h, q)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300, 80).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_80/cat.jpg");
    });
    it('Test fill construction, (w, h, q), us_auto', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300, 80).unsharpMask(wms.Defaults.AUTO).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_80,us_auto/cat.jpg");
    });
    it('Test fill construction, (w, h, q), us_auto shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300, 80).us(wms.Defaults.AUTO).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_80,us_auto/cat.jpg");
    });
    it('Test fill construction, (w, h, q_auto)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300, wms.Defaults.AUTO).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_auto/cat.jpg");
    });
    it('Test fill construction, (w, h, q), (r,a,t)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300, 80).unsharpMask(.3,.1,.5).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300,q_80,us_0.3_0.1_0.5/cat.jpg");
    });
    it('Test fit construction, (w,h,q)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().size(100, 300).quality(80).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/w_100,h_300,q_80/cat.jpg");
    });
    it('Test fit construction, (w,h,q) shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().size(100, 300).q(80).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/w_100,h_300,q_80/cat.jpg");
    });
    it('Test canvas construction, (w,h), a', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.canvas().size(100, 300).a(wms.Defaults.Anchor.LEFT).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/canvas/w_100,h_300,a_l/cat.jpg");
    });
    it('Test fill construction, (w,h)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fill().size(100, 300).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fill/w_100,h_300/cat.jpg");
    });
    it('Test crop construction, (w,h),x,y', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.crop().size(100, 300).x(20).y(30).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/crop/w_100,h_300,x_20,y_30/cat.jpg");
    });
    it('Test crop construction, (w,h),(x,y)', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.crop().size(100, 300).coords(20, 30).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/crop/w_100,h_300,x_20,y_30/cat.jpg");
    });
    it('Test wm construction, op,a', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.wm().opacity(100).alignment(wms.Defaults.Alignment.LEFT).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/wm/op_100,a_l/cat.jpg");
    });
    it('Test wm construction, op,a shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.wm().op(100).alignment(wms.Defaults.Alignment.LEFT).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/wm/op_100,a_l/cat.jpg");
    });
    it('Test wm construction, a,scl', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.wm().alignment(wms.Defaults.Alignment.LEFT).scale(4).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/wm/a_l,scl_4/cat.jpg");
    });
    it('Test wm construction, a,scl shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.wm().alignment(wms.Defaults.Alignment.LEFT).scl(4).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/wm/a_l,scl_4/cat.jpg");
    });
    it('Test adjust construction, br', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().brightness(100).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/br_100/cat.jpg");
    });
    it('Test adjust construction, br auto', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().brightness().name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/br_auto/cat.jpg");
        url = i.fit().brightness(wms.Defaults.AUTO).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/br_auto/cat.jpg");
    });
    it('Test adjust construction, all', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().brightness(100).contrast(100).saturation(100).hue(100).vibrance(100).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/br_100,con_100,sat_100,hue_100,vib_100/cat.jpg");
    });
    it('Test fit construction, all shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().br(100).con(100).sat(100).hue(100).vib(100).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/br_100,con_100,sat_100,hue_100,vib_100/cat.jpg");
    });
    it('Test adjust construction, auto', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().autoAdjust().name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/auto_adj/cat.jpg");
    });
    it('Test filter construction, all', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().oil().negative().pixelate(100).pixelateFaces(100).blur(100).sharpen(.1).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg");
    });
    it('Test filter construction, shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().oil().neg().pix(100).pixfs(100).blur(100).sharpen(.1).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg");
    });

    it('Test fit + filter construction, shorthand', function () {
        var i = new WixImage("http://test.wix.com", "12345");
        var url = i.fit().w(50).h(100).oil().neg().pix(100).pixfs(100).blur(100).sharpen(.1).q(90).name("cat.jpg").toUrl();
        expect(url).to.be("http://test.wix.com/12345/v1/fit/w_50,h_100,q_90,oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg");
    });

    it('Test parsing, fit', function () {
        var url = "http://test.wix.com/12345/v1/fit/w_100,h_300/cat.jpg";
        expect(wms.fromUrl(url).toUrl()).to.be(url);
    });

    it('Test parsing, adjustments', function () {
        var url = "http://test.wix.com/12345/v1/fit/br_100,con_100,sat_100,hue_100,vib_100/cat.jpg";
        expect(wms.fromUrl(url).toUrl()).to.be(url);
    });

    it('Test parsing, filters', function () {
        var url = "http://test.wix.com/12345/v1/canvas/oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg";
        expect(wms.fromUrl(url).toUrl()).to.be(url);
    });
    it('Test parsing, fit + adj', function () {
        var url = "http://test.wix.com/12345/v1/fit/w_50,h_100,q_90,oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg";
        var i = wms.fromUrl(url);
        expect(i.toUrl()).to.be(url);
        i.w(100);
        expect(i.toUrl()).to.be("http://test.wix.com/12345/v1/fit/w_100,h_100,q_90,oil,neg,pix_100,pixfs_100,blur_100,shrp_0.1/cat.jpg");
    });
});
/* jshint ignore:end */
