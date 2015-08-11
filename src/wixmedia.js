var Images = require("./images.js");
var crophelpers = require("./crophelpers.js");
var Uploader = require("./node/upload.js");

/**
 * @summary Entry point into the WixMedia service
 * @module WixMedia
 */
module.exports = {
    /**
     * @summary Creates a {@link WixImage} object from a passed in URL
     * @param {string} url The URL to parse
     * @returns {WixImage} a WixImage
     * @throws An exception if the URL was invalid
     */
    fromUrl : Images.fromUrl,
    /**
     * @summary Creates a new {@link WixImage}
     * @param {String} baseUrl the base URL where the image is hosted
     * @param {String} imageId the id of the image to manipulate
     * @param {String} [version="v1"] the optional version number.
     * @returns {WixImage} a new {@link WixImage}
	 * @snippet wiximage2.js Using WixImage in the browser, no AMD
	 * @snippet wiximage1.js Using WixImage in the browser or in node, using common.js modules
	 * @snippet wiximage3.js Using WixImage in the browser, using requirejs
     */
    WixImage : function(baseUrl, imageId, version) {
        return new Images.WixImage(baseUrl,imageId,version);
    },

    /**
     * @summary Image constants for use with Wix Media Services
     * @type {Defaults}
     */
    Defaults : Images.Defaults,

	/**
	 * @summary Returns a new UploadClient. Only available in Node.js
	 * @param {string} apiKey - your API key
	 * @param {string} secretKey - your secret key
	 * @returns {UploadClient} an upload client
	 */
	uploader : function(apiKey, secretKey) {
		return Uploader.client(apiKey, secretKey);
	},

	crop:{
		getContainLayout: crophelpers.getContainLayout,
		getCoverLayout: crophelpers.getCoverLayout
	}
};
