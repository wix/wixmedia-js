/* jshint ignore:start */
var wms = require('../../src/wixmedia');
var expect = require('expect.js');

describe("Media server crop utils", function(){

	describe(".getContainLayout()", function(){

		// |------|                >     |------|
		// |      |                >     |      |
		// |      |                >     ********
		// | box  |   *********    >     ********
		// |      |   * image *    >     |      |
		// |------|   *********    >     |------|
		it("should vertical center image that has size ratio larger then its box (image more landscape then box)", function(){
			var imageWidth = 20;
			var imageHeight = 10;
			var boxWidth = 100;
			var boxHeight = 200;
			var expectedOffset = { w:100, h:50, x:0, y:75 };

			var layout = wms.getContainLayout(imageWidth, imageHeight, boxWidth, boxHeight);

			expect(layout).to.eql(expectedOffset);
		});

		// |------------|   *********   >
		// |    box     |   *       *   >
		// |------------|   *       *   >
		//                  * image *   >     |----***----|
		//                  *       *   >     |    * *    |
		//                  *********   >     |----***----|
		it("should horizontal center image that has size ratio smaller than its box (image more portrait then box)", function(){
			var imageWidth = 150;
			var imageHeight = 300;
			var boxWidth = 100;
			var boxHeight = 50;
			var expectedOffset = { w:25, h:50, x:38, y:0 };

			var layout = wms.getContainLayout(imageWidth, imageHeight, boxWidth, boxHeight);

			expect(layout).to.eql(expectedOffset);
		});

	});

	describe(".getCoverLayout", function(){

		// |------|  *********     >     **********|-------|*********
		// |      |  * image *     >     *         |       |        *
		// |      |  *********     >     *         |       |        *
		// | box  |                >     *         |       |        *
		// |      |                >     *         |       |        *
		// |------|                >     **********|-------|*********
		it("should horizontal center image that has size ratio larger then its box (image more landscape then box)", function(){
			var imageWidth = 20;
			var imageHeight = 10;
			var boxWidth = 100;
			var boxHeight = 200;
			var expectedOffset = { w:400, h:200, x:-150, y:0 };

			var layout = wms.getCoverLayout(imageWidth, imageHeight, boxWidth, boxHeight);

			expect(layout).to.eql(expectedOffset);
		});

		//  |------------|  *********   >    **************
		//  |    box     |  *       *   >    *            *
		//  |------------|  *       *   >    *            *
		//                  *       *   >    *------------*
		//                  * image *   >    *            *
		//                  *       *   >    *------------*
		//                  *********   >    *            *
		//                              >    *            *
		//                              >    **************
		it("should vertical center image that has size ratio smaller than its box (image more portrait then box)", function(){
			var imageWidth = 150;
			var imageHeight = 300;
			var boxWidth = 200;
			var boxHeight = 80;
			var expectedOffset = { w:200, h:400, x:0, y:-160 };

			var layout = wms.getCoverLayout(imageWidth, imageHeight, boxWidth, boxHeight);

			expect(layout).to.eql(expectedOffset);
		});

	});

});
/* jshint ignore:end */
