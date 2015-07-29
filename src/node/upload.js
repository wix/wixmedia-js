var Q = require("q");
var rest = require("restler");
var FS = require('fs');
var mediaHttp = require("./mediaHttp.js");
var AuthClient = require("./AuthClient.js");


function decorate(context, data) {
	Object.defineProperty(context, "fileId", { get: function () { return data.file_url; } });
	Object.defineProperty(context, "iconUrl", { get: function () { return data.icon_url; } });
	Object.defineProperty(context, "fileUrl", { get: function () { return data.file_url; } });
	Object.defineProperty(context, "hash", { get: function () { return data.hash; } });
	Object.defineProperty(context, "fileSize", { get: function () { return data.file_size; } });
	Object.defineProperty(context, "fileName", { get: function () { return data.file_name; } });
	Object.defineProperty(context, "originalFileName", { get: function () { return data.original_file_name; } });
	Object.defineProperty(context, "rawData", { get: function () { return data; } });
}

/**
 * Information about an image that was uploaded
 * @alias ImageMedia
 * @constructor
 * @property {string} fileId - The id of the uploaded file
 * @property {string} imageId - The id of the uploaded image
 * @property {string} fileUrl - The url of the uploaded file. This is the same as the fileId
 * @property {string} fileSize - The size of the uploaded file
 * @property {string} fileName - The name of the uploaded file
 * @property {string} originalFileName - The original file name of the uploaded file
 * @property {string} width - If an image, the width of the image
 * @property {string} height - If an image, the height of the image
 * @property {string} rawData - the raw metadata
 */
function ImageMedia(data) {
	decorate(this, data);
	Object.defineProperty(this, "imageId", { get: function () { return data.file_url; } });
	Object.defineProperty(this, "width", { get: function () { return data.width; } });
	Object.defineProperty(this, "height", { get: function () { return data.height; } });
}

/**
 * Information about an audio file that was uploaded
 * @alias AudioMedia
 * @constructor
 * @property {string} fileId - The id of the uploaded file
 * @property {string} audioId - The id of the uploaded audio file
 * @property {string} fileUrl - The url of the uploaded file. This is the same as the fileId
 * @property {string} fileSize - The size of the uploaded file
 * @property {string} fileName - The name of the uploaded file
 * @property {string} originalFileName - The original file name of the uploaded file
 * @property {string} rawData - the raw metadata
 */
function AudioMedia(data) {
	decorate(this, data);
	Object.defineProperty(this, "audioId", { get: function () { return data.file_url; } });
}

/**
 * Information about a video file that was uploaded
 * @alias AudioMedia
 * @constructor
 * @property {string} fileId - The id of the uploaded file
 * @property {string} videoId - The id of the uploaded video file
 * @property {string} fileUrl - The url of the uploaded file. This is the same as the fileId
 * @property {string} fileSize - The size of the uploaded file
 * @property {string} fileName - The name of the uploaded file
 * @property {string} originalFileName - The original file name of the uploaded file
 * @property {string} rawData - the raw metadata
 */
function VideoMedia(data) {
	decorate(this, data);
	Object.defineProperty(this, "videoId", { get: function () { return data.file_url; } });
}

var ImageMode = {
	toMetadata : function(data) {
		return new ImageMedia(data);
	},
	getUrl : function() {
		return '/files/upload/url';
	},
	getMediaType : function() {
		return 'picture';
	}

};

var VideoMode = {
	toMetadata : function(data) {
		return new VideoMedia(data);
	},
	getUrl : function() {
		return '/files/video/upload/url';
	},
	getMediaType: function() {
		return 'video';
	}
};

var AudioMode = {
	toMetadata : function(data) {
		return new AudioMedia(data);
	},
	getUrl : function() {
		return '/files/upload/url';
	},
	getMediaType: function() {
		return 'music';
	}
};

function UploadClient(config) {
	AuthClient.call(this, config);
}

UploadClient.prototype = AuthClient.prototype;

UploadClient.prototype.getUploadUrl = function(mode) {
	var deferred = Q.defer();
	var that = this;
	this.getAuthToken().then(function(authToken) {
		var options = {
			headers : that.getAuthHeaders(authToken),
			path : mode.getUrl(),
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

function MediaFile(path) {
	this.path = path;
}

MediaFile.prototype.getUploadData = function() {
	var deferred = Q.defer();
	var that = this;
	Q.nfcall(FS.stat, this.path).then(function(stats) {
		deferred.resolve(rest.file(that.path, null, stats.size));
	}, function(error) {
		deferred.reject(error);
	});
	return deferred.promise;
};

function B64Data(imageName, data) {
	this.data = data;
	this.imageName = imageName;
}

B64Data.prototype.getUploadData = function() {
	var deferred = Q.defer();
	try {
		var matches = this.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

		if (matches === null || matches.length < 2) {
			deferred.reject('Bad image Base64 header');
		} else {
			deferred.resolve(rest.data(this.imageName, null, new Buffer(matches[2], 'base64')));
		}
	}catch(e) {
		deferred.reject('Bad image Base64 header');
	}
	return deferred.promise;
};

function handleReject(error, callback, deferred) {
	if(typeof callback === "function") {
		callback(error, null);
	}
	deferred.reject(error);
}

function uploadMedia(client, mode, mediaData, callback) {
	var deferred = Q.defer();

	client.getUploadUrl(mode).then(function(uploadUrl) {
		mediaData.getUploadData().then(function (uploadData) {
			"use strict";
			rest.post(uploadUrl, {
				multipart: true,
				headers: client.getAuthHeaders(client.authToken),
				data: {
					"media_type": mode.getMediaType(),
					"file": uploadData
				}

			}).on('complete', function (data) {
				if(data.hasOwnProperty('error_code')) {
					handleReject(data, callback, deferred);
				} else {
					var retVal = mode.toMetadata(data[0]);
					if (typeof callback === "function") {
						callback(null, retVal);
					}
					deferred.resolve(retVal);
				}
			}).on('error', function (data) {
				handleReject(data, callback, deferred);
			});
		}, function (error) {
			handleReject(error, callback, deferred);
		});
	}, function(error) {
		handleReject(error, callback, deferred);
	});

	if(typeof callback === "function") {
		var ref = setInterval(function() {
			if(deferred.promise.isFulfilled() || deferred.promise.isRejected()) {
				clearInterval(ref);
				return;
			}
		}, 100);
	} else {
		return deferred.promise;
	}
}

UploadClient.prototype.uploadImageFile = function (path, callback) {
	return uploadMedia(this, ImageMode, new MediaFile(path), callback);
};

UploadClient.prototype.uploadVideoFile = function (path, callback) {
	return uploadMedia(this, VideoMode, new MediaFile(path), callback);
};

UploadClient.prototype.uploadAudioFile = function (path, callback) {
	return uploadMedia(this, AudioMode, new MediaFile(path), callback);
};

UploadClient.prototype.uploadB64 = function (imageName, data, callback) {
	return uploadMedia(this, ImageMode, new B64Data(imageName, data), callback);
};

/**
 * Callback for a successful file upload
 *
 * @callback UploadStatus
 * @param {Object} error - Information about the error that occurred
 * @param {UploadedData} data - Information about the uploaded data
 */

/**
 * Callback for a failing file upload
 *
 * @callback UploadFailure
 */

module.exports = {
	/**
	 * Client to upload media to the Wix Media Platform
	 * @constructor
	 * @alias UploadClient
	 */
	client : function(config) {
		var c = new UploadClient(config);
		return {
			images : {
				/**
				 * Uploads an image to the Wix Media Platform. Accepts callbacks, or returns a promise. If callbacks are not supplied, a Promise is returned
				 * @memberOf UploadClient
				 * @param {string} path - The local path to the image
				 * @param {UploadStatus} [success=null] - An optional callback triggered on success
				 * @returns {Promise<UploadedMedia>} A promise that will yield an {@link UploadedData} object, or null if using callbacks
				 */
				uploadFromFile: function (path, callback) {
					return c.uploadImageFile(path, callback);
				},
				/**
				 * Uploads a base64 encoded image to the Wix Media Platform. Accepts callbacks, or returns a promise. If callbacks are not supplied, a Promise is returned
				 * @memberOf UploadClient
				 * @param {string} name - The name of the image
				 * @param {string} data - The data of the image. Data must start with data:image/{jpg|png|gif|..};base64,
				 * @param {UploadStatus} [success=null] - An optional callback triggered on success
				 * @returns {Promise<ImageMedia>} A promise that will yield an {@link ImageMedia} object, or null if using callbacks
				 */
				uploadFromB64: function (imageName, data, callback) {
					return c.uploadB64(imageName, data, callback);
				}
			},
			video : {
				/**
				 * Uploads a video file to the Wix Media Platform. Accepts callbacks, or returns a promise. If callbacks are not supplied, a Promise is returned
				 * @memberOf UploadClient
				 * @param {string} path - The local path to the video file
				 * @param {UploadStatus} [success=null] - An optional callback triggered on success
				 * @returns {Promise<VideoMedia>} A promise that will yield an {@link VideoMedia} object, or null if using callbacks
				 */
				uploadFromFile : function(path, callback) {
					return c.uploadVideoFile(path, callback);
				}
			},
			audio : {
				/**
				 * Uploads an audio file to the Wix Media Platform. Accepts callbacks, or returns a promise. If callbacks are not supplied, a Promise is returned
				 * @memberOf UploadClient
				 * @param {string} path - The local path to the audio file
				 * @param {UploadStatus} [success=null] - An optional callback triggered on success
				 * @returns {Promise<AudioMedia>} A promise that will yield an {@link AudioMedia} object, or null if using callbacks
				 */
				uploadFromFile : function(path, callback) {
					return c.uploadAudioFile(path, callback);
				}
			}
		};
	}
};