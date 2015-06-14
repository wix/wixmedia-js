var ImageApi = require("./src/images.js");

module.exports = function(baseUrl, uri, title){
	return new ImageApi(baseUrl, uri, title);
};