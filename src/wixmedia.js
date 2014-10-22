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
     * @returns {WixImage} a new {@link WixImage}
     */
    WixImage : function(baseUrl, imageId) {
        return new Images.WixImage(baseUrl, imageId);
    },

    /**
     * Image constants for use with Wix Media Services
     * @type {Defaults}
     */
    Defaults : new Images.Defaults()
};