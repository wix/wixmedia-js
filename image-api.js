var Images = require("./src/images.js");
var crophelpers = require("./src/crophelpers.js");

module.exports = {
	WixImage : function(baseUrl, imageId, version) {
		return new Images.WixImage(baseUrl,imageId,version);
	},
	crop:{
		getContainLayout: crophelpers.getContainLayout,
		getCoverLayout: crophelpers.getCoverLayout
	}
};
