var Q = require("q");
var rest = require("restler");
var FS = require('fs');
var mediaHttp = require("./mediaHttp.js");
var AuthClient = require("./AuthClient.js");


var WIX_MEDIA_UPLOAD_URL_PATH = '/files/upload/url';

/**
 * Information about media that was uploaded
 * @alias UploadedMedia
 * @constructor
 * @property {string} fileId - The id of the uploaded file
 * @property {string} imageId - The id of the uploaded image, if an image
 * @property {string} fileUrl - The url of the uploaded file. This is the same as the fileId
 * @property {string} fileSize - The size of the uploaded file
 * @property {string} fileName - The name of the uploaded file
 * @property {string} originalFileName - The original file name of the uploaded file
 * @property {string} width - If an image, the width of the image
 * @property {string} height - If an image, the height of the image
 */
function UploadedMedia(data) {
	Object.defineProperty(this, "fileId", { get: function () { return data.file_url; } });
	Object.defineProperty(this, "fileUrl", { get: function () { return data.file_url; } });
	Object.defineProperty(this, "imageId", { get: function () { return data.file_url; } });
	Object.defineProperty(this, "fileSize", { get: function () { return data.file_size; } });
	Object.defineProperty(this, "fileName", { get: function () { return data.file_name; } });
	Object.defineProperty(this, "originalFileName", { get: function () { return data.original_file_name; } });
	Object.defineProperty(this, "width", { get: function () { return data.width; } });
	Object.defineProperty(this, "height", { get: function () { return data.height; } });
}

function UploadClient(apiKey, secretKey) {
	AuthClient.call(this, apiKey, secretKey);
}

UploadClient.prototype = AuthClient.prototype;

UploadClient.prototype.getUploadUrl = function() {
	var deferred = Q.defer();
	var that = this;
	this.getAuthToken().then(function(authToken) {
		var options = {
			headers : that.getAuthHeaders(authToken),
			path : WIX_MEDIA_UPLOAD_URL_PATH,
			host : mediaHttp.CLOUD_URL
		};
		mediaHttp.request(options).then(function(data) {
			deferred.resolve(data.data.upload_url);
		}, function(error) {
			deferred.reject(error);
		});
	}, function(error) {
		deferred.reject(error);
	});
	return deferred.promise;
};

UploadClient.prototype.upload = function (path, success, failure) {
	var deferred = Q.defer();
	var that = this;
	this.getUploadUrl().then(function(uploadUrl) {
		Q.nfcall(FS.stat, path).then(function(stats) {
			rest.post(uploadUrl, {
				multipart: true,
				headers : that.getAuthHeaders(that.authToken),
				data : {
					"media_type" : "picture",
					"file" : rest.file(path, null, stats.size)
				}

			}).on('complete', function(data) {
				var retVal = new UploadedMedia(data[0]);
				if(typeof success === "function") {
					success(retVal);
				}
				deferred.resolve(retVal);
			}).on('error', function(data) {
				deferred.reject(data);
			});
		});

	}, function(error) {
		if(typeof failure === "function") {
			failure(error);
		}
		deferred.reject(error);
	});
	if(typeof success === "function") {
		var ref = setInterval(function() {
			if(deferred.promise.isFulfilled() || deferred.promise.isRejected()) {
				clearInterval(ref);
				return;
			}
		}, 100);
	} else {
		return deferred.promise;
	}
};

/**
 * Callback for a successful file upload
 *
 * @callback UploadSuccess
 * @param {UploadedData} data - Information about the uploaded data
 */

/**
 * Callback for a failing file upload
 *
 * @callback UploadFailure
 * @param {Object} error - Information about the error that occurred
 */

module.exports = {
	/**
	 * Client to upload media to the Wix Media Platform
	 * @constructor
	 * @alias UploadClient
	 */
	client : function(apiKey, secretKey) {
		var c = new UploadClient(apiKey, secretKey);
		return {
			/**
			 * Uploads a file to the Wix Media Platform. Accepts callbacks, or returns a promise. If callbacks are not supplied, a Promise is returned
			 * @memberOf UploadClient
			 * @param {string} path - The local path to the image
			 * @param {UploadSuccess} [success=null] - An optional callback triggered on success
			 * @param {UploadFailure} [failure=null] - An optional callback triggered on failure
			 * @returns {Promise<UploadedMedia>} A promise that will yield an {@link UploadedData} object, or null if using callbacks
			 */
			uploadFromFile : function(path, success, failure) {
				return c.upload(path, success, failure);
			}
		};
	}
};