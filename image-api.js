var ImageApi = require("./src/images.js");
var crophelpers = require("./src/crophelpers.js");

module.exports = function(baseUrl, uri, title){
	return new ImageApi(baseUrl, uri, title);
};

module.exports.getContainLayout = crophelpers.getContainLayout;
module.exports.getCoverLayout = crophelpers.getCoverLayout;