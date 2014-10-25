var Images = require("./images.js");

/**
 * Entry point into the WixMedia service
 * @module WixMedia
 */
module.exports = {
    /**
     * Creates a {@link WixImage} object from a passed in URL
     * @param {string} url The URL to parse
     * @returns {WixImage} a WixImage
     * @throws An exception if the URL was invalid
     */
    fromUrl : Images.fromUrl,
    /**
     * Creates a new {@link WixImage}
     * @param {String} baseUrl the base URL where the image is hosted
     * @param {String} imageId the id of the image to manipulate
     * @param {String} [version="v1"] the optional version number.
     * @returns {WixImage} a new {@link WixImage}
     */
    WixImage : function(baseUrl, imageId, version) {
        return new Images.WixImage(baseUrl,imageId,version);
    },

    /**
     * Image constants for use with Wix Media Services
     * @type {Defaults}
     */
    Defaults : Images.Defaults
};
