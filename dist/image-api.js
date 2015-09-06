!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.imageApi=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Images = _dereq_("./src/images.js");
var crophelpers = _dereq_("./src/crophelpers.js");

module.exports = {
	WixImage : function(baseUrl, imageId, version) {
		return new Images.WixImage(baseUrl,imageId,version);
	},
	crop:{
		getContainLayout: crophelpers.getContainLayout,
		getCoverLayout: crophelpers.getCoverLayout
	}
};

},{"./src/crophelpers.js":2,"./src/images.js":3}],2:[function(_dereq_,module,exports){
/**
 * Takes image and box dimensions, and return the result layout
 * that the image should be in order to be contained and centered
 * inside the box.
 *
 * @param {number} imageWidth original image width
 * @param {number} imageHeight original image height
 * @param {number} boxWidth box width to fit image into
 * @param {number} boxHeight box height to fit image into
 * @returns {{x:number, y:number, w:number, h:number }}
 */
function getContainLayout(imageWidth, imageHeight, boxWidth, boxHeight){
	var layout = { x:0, y:0 };
	var imageRatio = imageWidth / imageHeight;
	var boxRatio = boxWidth / boxHeight;
	if(imageRatio < boxRatio){
		layout.w = boxHeight * imageRatio;
		layout.h = boxHeight;
		layout.x = Math.round(boxWidth/2 - layout.w/2);
	} else {
		layout.w = boxWidth;
		layout.h = boxWidth / imageRatio;
		layout.y = Math.round(boxHeight/2 - layout.h/2);
	}
	return layout;
}
/**
 * Takes image and box dimensions, and return the result layout
 * that the image should be in order to cover (center) the box.
 *
 * @param {number} imageWidth original image width
 * @param {number} imageHeight original image height
 * @param {number} boxWidth box width that the image should cover
 * @param {number} boxHeight box height that the image should cover
 * @returns {{x:number, y:number, w:number, h:number }}
 */
function getCoverLayout(imageWidth, imageHeight, boxWidth, boxHeight){
	var layout = { x:0, y:0 };
	var imageRatio = imageWidth / imageHeight;
	var boxRatio = boxWidth / boxHeight;
	if(imageRatio < boxRatio){
		layout.w = boxWidth;
		layout.h = Math.round(boxWidth / imageRatio);
		layout.y = Math.round(boxHeight/2 - layout.h/2);
	} else {
		layout.w = Math.round(boxHeight * imageRatio);
		layout.h = boxHeight;
		layout.x = Math.round(boxWidth/2 - layout.w/2);
	}
	return layout;
}

module.exports = {
	getContainLayout: getContainLayout,
	getCoverLayout: getCoverLayout
};


},{}],3:[function(_dereq_,module,exports){
var extend = _dereq_("./utils").extend;
var parser = _dereq_("./parser");

var DEFAULT_QUALITY = 75;
var DEFAULT_US_RADIUS = 0.50;
var DEFAULT_US_THRESHOLD = 0.00;
var DEFAULT_US_AMOUNT = 0.20;
var DEFAULT_AUTO = "auto";

/**
 * @summary Constants for use with image operations
 * @class
 */
var Defaults = {
	/**
	 * @summary Alignments for use with image manipulations
	 * @readonly
	 * @enum
	 */
	Alignment : {
		/**
		 * Focuses or aligns on the center of the image, both vertical and horizontal center.
		 * @constant
		 */
		CENTER: "c",
		/**
		 * Focuses or aligns on the top of the image, horizontal center.
		 */
		TOP: "t",
		/**
		 * Focuses or aligns on top left side of the image.
		 */
		TOP_LEFT: "tl",
		/**
		 * Focuses or aligns on top right side of the image.
		 * @constant
		 */
		TOP_RIGHT: "tr",
		/**
		 * Focuses or aligns on the bottom of the image, horizontal center.
		 */
		BOTTOM: "b",
		/**
		 * Focuses or aligns on the bottom left side of the image.
		 */
		BOTTOM_LEFT: "bl",
		/**
		 * Focuses or aligns on the bottom right side of the image.
		 */
		BOTTOM_RIGHT: "br",
		/**
		 * Focuses or aligns on the left side of the image, horizontal center.
		 */
		LEFT: "l",
		/**
		 * Focuses or aligns on the right side of the image, horizontal center.
		 */
		RIGHT: "r",
		/**
		 * Focus on a face on the image. Detects a face in the picture and centers on it. When multiple faces are detected in the picture, the focus will be on one of them.
		 */
		FACE_RECOGNITION: "f",
		/**
		 * Focus on all faces in the image. Detects multiple faces and centers on them. Will do a best effort to have all the faces in the new image, depending on the size of the new canvas.     * @constant
		 */
		ALL_FACES: "fs"
	},
	/**
	 * @summary Resize filters for use with resize operations
	 * @readonly
	 * @enum
	 */
	ResizeFilters : {
		POINT: 1,
		BOX: 2,
		TRIANGLE: 3,
		HERMITE: 4,
		HANNING: 5,
		HAMMING: 6,
		BLACKMAN: 7,
		GAUSSIAN: 8,
		QUADRATIC: 9,
		CUBIC: 10,
		CATROM: 11,
		MITCHELL: 12,
		JINC: 13,
		SINC: 14,
		SINC_FAST: 15,
		KAISER: 16,
		WELCH: 17,
		PARZEN: 18,
		BOHMAN: 19,
		BARTLETT: 20,
		LAGRANGE: 21,
		LANCZOS: 22,
		LANCZOS_SHARP: 23,
		LANCZOS2: 24,
		LANCZOS2_SHARP: 25,
		ROBIDOUX: 26,
		ROBIDOUX_SHARP: 27,
		COSINE: 28
	},
	/**
	 * @summary Anchors for use with canvas
	 * @borrows Defaults#Alignment as Defaults#Anchor
	 */
	Anchor : this.Alignment,

	/**
	 * @summary The default quality for jpgs
	 * @type {number}
	 * @readonly
	 * @member
	 */
	QUALITY : DEFAULT_QUALITY,

	/**
	 * @summary The default unsharpen radius
	 * @type {number}
	 * @readonly
	 * @member
	 */
	US_RADIUS : DEFAULT_US_RADIUS,

	/**
	 * @summary The default unsharpen threshold
	 * @type {number}
	 * @readonly
	 * @member
	 */
	US_AMOUNT : DEFAULT_US_AMOUNT,

	/**
	 * @summary The default unsharpen amount
	 * @type {number}
	 * @readonly
	 * @member
	 */
	US_THRESHOLD : DEFAULT_US_THRESHOLD,

	/**
	 * @summary Default value `auto`
	 * @type {string}
	 */
	AUTO : DEFAULT_AUTO
};

/**
 * @summary Provides methods used for adjustment APIs.
 * @description Not meant to be used directly.
 *
 * @mixin
 * @alias AdjustMixin
 */
function AdjustMixin(init) {
	this.adjustments = {};
	if (init !== undefined) {
		for (var a in init) {
			if (init.hasOwnProperty(a)) {
				this.adjustments[a] = init[a];
			}
		}
	}
}
AdjustMixin.prototype = {
	/**
	 * @summary brightness of the image
	 * @description supports `auto` or a numeric value between `-100` and `100`
	 * @param {string|number} b a Number between `-100` and `100` or 'auto'
	 * @returns {this} the operation
	 * @memberof AdjustMixin
	 * @snippet brightness1.js
	 * @snippet brightness2.js
	 */
	brightness: function (b) {
		this.adjustments.br = typeof b !== "undefined" ? b : DEFAULT_AUTO;
		return this;
	},
	/**
	 * @summary contrast of the image.
	 * @description supports `auto` or a numeric value between `-100` and `100`
	 * @param {string|number} c a Number between `-100` and `100` or `auto`
	 * @returns {this} the operation
	 * @memberof AdjustMixin
	 * @snippet contrast1.js
	 * @snippet contrast2.js
	 */
	contrast: function (c) {
		this.adjustments.con = typeof c !== "undefined" ? c : DEFAULT_AUTO;
		return this;
	},
	/**
	 * @summary saturation of the image.
	 * @description supports `auto` or a numeric value between `-100` and `100`
	 * @param {string|number} s a Number between `-100` and `100` or `auto`
	 * @memberof AdjustMixin
	 * @returns {this} the operation
	 */
	saturation: function (s) {
		this.adjustments.sat = typeof s !== "undefined" ? s : DEFAULT_AUTO;
		return this;
	},
	/**
	 * @summary hue of the image.
	 * @description supports `auto` or a numeric value between `-100` and `100`
	 * @param {string|number} h a Number between `-100` and `100` or `auto`
	 * @memberof AdjustMixin
	 * @returns {this} the operation
	 */
	hue: function (h) {
		this.adjustments.hue = typeof h !== "undefined" ? h : DEFAULT_AUTO;
		return this;
	},
	///**
	// * vibrance of the image. supports 'auto' or a numeric value between -100 and 100
	// * @param {string|number} v a Number between -100 and 100 or 'auto'
	// * @returns {this} the operation
	// */
	//vibrance: function (v) {
	//  this.adjustments.vib = v || DEFAULT_AUTO;
	//  return this;
	//},
	///**
	// * Automatically adjusts the brightness, contrast, hue, vibrance and saturation
	// * @param {boolean} [auto=true] enabled
	// * @returns {this} the operation
	// */
	//autoAdjust: function (auto) {
	//  if (auto !== undefined && auto === false) {
	//    delete this.adjustments.auto_adj;
	//    return this;
	//  }
	//  this.adjustments.auto_adj = null;
	//  return this;
	//},
	/**
	 * @summary Indicates that this operation has adjustment parameters
	 * @returns {boolean} true if adjustments are set
	 * @memberof AdjustMixin
	 */
	hasAdjustments: function () {
		for (var a in this.adjustments) {
			if (this.adjustments.hasOwnProperty(a)) {
				return true;
			}
		}
		return false;
	}
};
/**
 * @summary An alias for `brightness`
 * @name br
 * @function
 * @returns {this} the operation
 * @memberof AdjustMixin
 */
AdjustMixin.prototype.br = AdjustMixin.prototype.brightness;
/**
 * @summary An alias for `contrast`
 * @name con
 * @function
 * @returns {this} the operation
 * @memberof AdjustMixin
 */
AdjustMixin.prototype.con = AdjustMixin.prototype.contrast;
/**
 * @summary An alias for `saturation`
 * @name sat
 * @function
 * @returns {this} the operation
 * @memberof AdjustMixin
 */
AdjustMixin.prototype.sat = AdjustMixin.prototype.saturation;
//AdjustMixin.prototype.vib = AdjustMixin.prototype.vibrance;

/**
 * @summary Provides methods used for filter APIs.
 * @mixin
 * @alias FilterMixin
 */
function FilterMixin(init) {
	this.filters = {};
	if (init !== undefined) {
		for (var f in init) {
			if (init.hasOwnProperty(f)) {
				this.filters[f] = init[f];
			}
		}
	}
}
FilterMixin.prototype = {
	/** @lends FilterMixin */
	/**
	 * @summary Applies an oil paint effect to the image.
	 * @param {boolean} [oil=true] enabled
	 * @memberof FilterMixin
	 * @returns {this} the operation
	 */
	oil: function (oil) {
		if (oil !== undefined && oil === false) {
			delete this.filters.oil;
		} else {
			this.filters.oil = null;
		}
		return this;
	},
	/**
	 * @summary Negates the colors of the image.
	 * @param {boolean} [neg=true] enabled
	 * @memberof FilterMixin
	 * @returns {this} the operation
	 */
	negative: function (neg) {
		if (neg !== undefined && neg === false) {
			delete this.filters.neg;
		} else {
			this.filters.neg = null;
		}
		return this;
	},
	/**
	 * @summary Applies a pixelate effect to the image.
	 * @param {number} pixels the width of pixelation squares, in pixels
	 * @returns {this} the operation
	 * @memberof FilterMixin
	 */
	pixelate: function (pixels) {
		this.filters.pix = pixels;
		return this;
	},
	///**
	// * Applies a pixelate effect to faces in the image.
	// * @param {number} pixels the width of pixelation squares, in pixels
	// * @returns {this} the operation
	// */
	//pixelateFaces: function (pixels) {
	//  this.filters.pixfs = pixels;
	//  return this;
	//},
	/**
	 * @summary Applies a blur effect to the image.
	 * @param {number} blur percent to blur the image
	 * @memberof FilterMixin
	 * @returns {this} the operation
	 */
	blur: function (blur) {
		this.filters.blur = blur;
		return this;
	},
	/**
	 * @summary Sharpens the image using radius, amount & threshold parameters
	 * @param {number} radius the unsharp mask radius. default value: `0.50`
	 * @param {number} amount the unsharp mask amount. default value: `0.20`.
	 * @param {number} amount the unsharp mask threshold. default value: `0.00`.
	 * @returns {this} the operation
	 * @memberof FilterMixin
	 */
	unsharpMask: function (r, a, t) {
		if (a === undefined && t === undefined && (r === undefined || r === DEFAULT_AUTO)) {
			this.filters.us = DEFAULT_AUTO;
		} else {
			this.filters.us = r + "_" + a + "_" + t;
		}
		return this;
	},
	/**
	 * @summary Sharpens the image using radius
	 * @param {number} radius sharpening mask radius, `0` to image size
	 * @returns {this} the operation
	 * @memberof FilterMixin
	 */
	sharpen: function (radius) {
		this.filters.shrp = radius;
		return this;
	},
	/**
	 * @summary Indicates that this operation has filter parameters
	 * @returns {boolean} true if filters are set
	 * @memberof FilterMixin
	 */
	hasFilters: function () {
		for (var a in this.filters) {
			if (this.filters.hasOwnProperty(a)) {
				return true;
			}
		}
		return false;
	}
};

/**
 * @summary An alias for `pixelate`
 * @name pix
 * @function
 * @returns {this} the operation
 * @memberof FilterMixin
 */
FilterMixin.prototype.pix = FilterMixin.prototype.pixelate;
/**
 * @summary An alias for `negative`
 * @name neg
 * @function
 * @returns {this} the operation
 * @memberof FilterMixin
 */
FilterMixin.prototype.neg = FilterMixin.prototype.negative;
/**
 * @summary An alias for `pixelateFaces`
 * @name pixfs
 * @function
 * @returns {this} the operation
 * @memberof FilterMixin
 */
FilterMixin.prototype.pixfs = FilterMixin.prototype.pixelateFaces;
/**
 * @summary An alias for `unsharpMask`
 * @name us
 * @function
 * @returns {this} the operation
 * @memberof FilterMixin
 */
FilterMixin.prototype.us = FilterMixin.prototype.unsharpMask;

/**
 * @summary Provides methods used for base operation APIs.
 * @mixin
 * @alias OperationMixin
 */
function OperationMixin(endpoint, imageId, version, opName, init, filters, adjustments) {
	this.endpoint = endpoint;
	this.imageId = imageId;
	this.version = version;
	this.opName = opName;

	/**
	 * @summary defaults for operations
	 * @member
	 * @name Defaults
	 * @type {Defaults}
	 * @memberof OperationMixin
	 */
	this.Defaults = Defaults;
	AdjustMixin.call(this, adjustments);
	FilterMixin.call(this, filters);
	this.operations = {};
	if (init !== undefined) {
		for (var p in init) {
			if (init.hasOwnProperty(p)) {
				this.operations[p] = init[p];
			}
		}
	}
}

extend(OperationMixin.prototype, AdjustMixin.prototype);
extend(OperationMixin.prototype, FilterMixin.prototype);

function outputParams(params) {
	var out = "";
	for (var a in params) {
		if (params.hasOwnProperty(a)) {
			if (out.length > 0) {
				out += ",";
			}
			out += (params[a] !== null) ? (a + "_" + params[a]) : a;
		}
	}
	return out;
}
/**
 * @summary Sets the name of the image to return
 * @param {string} name the name of the image
 * @returns {this} the operation
 * @memberof OperationMixin
 */
OperationMixin.prototype.name = function (name) {
	this.imageName = name;
	return this;
};

/**
 * @summary Returns the URL of the configured image
 * @returns {String} the URL of the image
 * @memberof OperationMixin
 */
OperationMixin.prototype.toUrl = function () {
	var prefix = "";
	if (this.endpoint !== null && this.endpoint.length > 4 && this.endpoint.substring(0, 4) !== "http") {
		if (this.endpoint.substring(0, 2) !== "//") {
			prefix = "//";
		}
	}

	var out = prefix + this.endpoint + "/" + this.imageId + "/" + this.version + "/" + this.opName + "/";

	var params = outputParams(this.operations);
	if (this.hasAdjustments()) {
		if (params.length > 0) {
			params += ",";
		}
		params += outputParams(this.adjustments);
	}
	if (this.hasFilters()) {
		if (params.length > 0) {
			params += ",";
		}
		params += outputParams(this.filters);
	}
	return out + params + "/" + this.imageName;
};

/**
 * @summary Provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin
 * @alias WidthHeightQualityMixin
 */
function WidthHeightQualityMixin() {
}
WidthHeightQualityMixin.prototype = {
	/**
	 * @summary The width constraint
	 * @param {Number} w a number greater than `0`
	 * @returns {this} the operation
	 * @memberof WidthHeightQualityMixin
	 */
	width: function (w) {
		this.operations.w = w;
		return this;
	},
	/**
	 * @summary The height constraint
	 * @param {Number} h a number greater than `0`
	 * @returns {this} the operation
	 * @memberof WidthHeightQualityMixin
	 */
	height: function (h) {
		this.operations.h = h;
		return this;
	},
	/**
	 * @summary The shorthand to set width and height
	 * @param {Number} w a number greater than `0`
	 * @param {Number} h a number greater than `0`
	 * @returns {this} the operation
	 * @memberof WidthHeightQualityMixin
	 */
	size: function (w, h, q) {
		this.width(w);
		this.height(h);
		if (q !== undefined) {
			this.quality(q);
		}
		return this;
	},
	/**
	 * @summary The quality constraint, if the image is a jpg
	 * @param {Number} [q=75] a number from `0` to `100`
	 * @returns {this} the operation
	 * @memberof WidthHeightQualityMixin
	 */
	quality: function (q) {
		this.operations.q = q || 75;
		return this;
	},
	/**
	 * @summary Applies baseline encoding on a jpg, instead of progressive encoding.
	 * @param {boolean} [bl=true] enable progressive encoding
	 * @returns {this} the operation
	 * @memberof WidthHeightQualityMixin
	 */
	baseline: function (bl) {
		if (bl !== undefined && bl === false) {
			delete this.operations.bl;
		} else {
			this.operations.bl = null;
		}
		return this;
	}
};
/**
 * @summary An alias for `width`
 * @name w
 * @function
 * @returns {this} the operation
 * @memberof WidthHeightQualityMixin
 */
WidthHeightQualityMixin.prototype.w = WidthHeightQualityMixin.prototype.width;
/**
 * @summary An alias for `height`
 * @name h
 * @function
 * @returns {this} the operation
 * @memberof WidthHeightQualityMixin
 */
WidthHeightQualityMixin.prototype.h = WidthHeightQualityMixin.prototype.height;
/**
 * @summary An alias for `quality`
 * @name q
 * @function
 * @returns {this} the operation
 * @memberof WidthHeightQualityMixin
 */
WidthHeightQualityMixin.prototype.q = WidthHeightQualityMixin.prototype.quality;
/**
 * @summary An alias for `baseline`
 * @name bl
 * @function
 * @returns {this} the operation
 * @memberof WidthHeightQualityMixin
 */
WidthHeightQualityMixin.prototype.bl = WidthHeightQualityMixin.prototype.baseline;

/**
 * @summary Provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin
 * @alias ResizeFillMixin
 */
function ResizeFillMixin() {
}

/**
 * @summary The resize filter
 * @param {number} rf the filter to use, from {@link Defaults#ResizeFilters}
 * @returns {this} the operation
 * @memberof ResizeFillMixin
 */
ResizeFillMixin.prototype.resizeFill = function (rf) {
	this.operations.rf = rf;
	return this;
};

/**
 * @summary An alias for `resizeFill`
 * @name rf
 * @function
 * @returns {this} the operation
 * @memberof ResizeFillMixin
 */
ResizeFillMixin.prototype.rf = ResizeFillMixin.prototype.resizeFill;

/**
 * @summary Provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin
 * @alias AlignmentMixin
 */
function AlignmentMixin() {
}

AlignmentMixin.prototype = {
	/**
	 * @summary Sets the alignment value for this operation {@link Defaults#Alignment}
	 * @param {Alignments} a the alignment value
	 * @returns {this} the operation
	 * @memberof AlignmentMixin
	 */
	alignment: function (a) {
		this.operations.al = a;
		return this;
	}
};
/**
 * @summary An alias for `alignment`
 * @name al
 * @function
 * @returns {this} the operation
 * @memberof AlignmentMixin
 */
AlignmentMixin.prototype.al = AlignmentMixin.prototype.alignment;

/**
 * @summary Resizes the image canvas.
 * @description Fills the width and height boundaries and crops any excess image data.
 * The resulting image will match the width and height constraints without scaling the image.
 * @constructor Canvas
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 * @mixes OperationMixin
 */
function Canvas(endpoint, imageId, version, data, filter, adjust) {
	OperationMixin.call(this, endpoint, imageId, version, "canvas", data, filter, adjust);
}

extend(Canvas.prototype, OperationMixin.prototype);
extend(Canvas.prototype, WidthHeightQualityMixin.prototype);
extend(Canvas.prototype, AlignmentMixin.prototype);

/**
 * @summary The background color, in case the canvas size is larger than the image itself.
 * @param {string} c an RGB value, of form `rrggbb`
 * @returns {this} the operation
 */
Canvas.prototype.c = function (c) {
	this.operations.c = c;
	return this;
};

/**
 * @summary Create an image with the exact given width and height while retaining original proportions.
 * @description Uses only part of the image that fills the given dimensions. Only part of the original image
 * might be visible if the required proportions are different than the original ones.
 * @constructor Fill
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes AlignmentMixin
 * @mixes WidthHeightQualityMixin
 * @mixes ResizeFillMixin
 * @mixes OperationMixin
 */
function Fill(endpoint, imageId, version, data, filter, adjust) {
	OperationMixin.call(this, endpoint, imageId, version, "fill", data, filter, adjust);
}
extend(Fill.prototype, OperationMixin.prototype);
extend(Fill.prototype, WidthHeightQualityMixin.prototype);
extend(Fill.prototype, AlignmentMixin.prototype);
extend(Fill.prototype, ResizeFillMixin.prototype);

/**
 * @summary Resizes the image to fit to the specified width and height while retaining original image proportion.
 * @description The entire image will be visible but not necessarily fill the area specified by the width and height.
 * @constructor Fit
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 * @mixes ResizeFillMixin
 * @mixes OperationMixin
 */
function Fit(endpoint, imageId, version, data, filter, adjust) {
	OperationMixin.call(this, endpoint, imageId, version, "fit", data, filter, adjust);
}
extend(Fit.prototype, OperationMixin.prototype);
extend(Fit.prototype, WidthHeightQualityMixin.prototype);
extend(Fit.prototype, ResizeFillMixin.prototype);

/**
 * @summary Crops the image based on the supplied coordinates.
 * @description Starts at the `x`, `y` pixel coordinates along with the width and height parameters.
 * @constructor Crop
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 * @mixes OperationMixin
 */
function Crop(endpoint, imageId, version, data, filter, adjust) {
	OperationMixin.call(this, endpoint, imageId, version, "crop", data, filter, adjust);
}
extend(Crop.prototype, OperationMixin.prototype);
extend(Crop.prototype, WidthHeightQualityMixin.prototype);

/**
 * @summary The `x` value of the crop
 * @param {number} x the x value
 * @returns {this} the operation
 */
Crop.prototype.x = function (x) {
	this.operations.x = x;
	return this;
};

/**
 * @summary The `y` value of the crop
 * @param {number} y the y value
 * @returns {this} the operation
 */
Crop.prototype.y = function (y) {
	this.operations.y = y;
	return this;
};

/**
 * @summary A shorthand for setting the `x` and `y` coordinates for this crop
 * @param {number} x the x value
 * @param {number} y the y value
 * @returns {Crop}
 */
Crop.prototype.coords = function (x, y) {
	this.x(x);
	this.y(y);
	return this;
};

///**
// * Enables users to apply watermark such as copyright notice in order to protect their images.
// * @constructor Watermark
// * @mixes AdjustMixin
// * @mixes FilterMixin
// * @mixes AlignmentMixin
// */
//function Watermark(endpoint, imageId, version, data, filter, adjust) {
//  OperationMixin.call(this, endpoint, imageId, version, "wm", data, filter, adjust);
//}
//
//extend(Watermark.prototype, OperationMixin.prototype);
//extend(Watermark.prototype, AlignmentMixin.prototype);
//
///**
// * The watermark image id. Please notice that the wmid format is similar to the file_id format used earlier in the URL. Must be url-plus encoded.
// * @param {String} wmid a string identifier
// * @returns {Watermark}
// */
//Watermark.prototype.wmid = function (wmid) {
//  this.operations.wmid = wmid;
//  return this;
//};
///**
// * The Watermark opacity.
// * @param {number} o a number between 0 and 100
// * @returns {Watermark}
// */
//Watermark.prototype.opacity = function (o) {
//  this.operations.op = o;
//  return this;
//};
//Watermark.prototype.op = Watermark.prototype.opacity;
///**
// * Watermark horizontal scaling as percents of the requested image width
// * @param {number} o a percent between 0 and 100
// * @returns {Watermark}
// */
//Watermark.prototype.scale = function (s) {
//  this.operations.scl = s;
//  return this;
//};
//Watermark.prototype.scl = Watermark.prototype.scale;

function fromUrl(url) {
	var data = parser.parse(url);
	var target = null, filter = null, adjust = null;
	if (data.api) {
		if (data.api.hasOwnProperty('fit')) {
			target = new Fit(data.endpoint, data.imageId, data.version, data.api.fit, data.api.filter, data.api.adjust).name(data.imageName);
		} else if (data.api.hasOwnProperty('canvas')) {
			target = new Canvas(data.endpoint, data.imageId, data.version, data.api.canvas, data.api.filter, data.api.adjust).name(data.imageName);
		} else if (data.api.hasOwnProperty('fill')) {
			target = new Fill(data.endpoint, data.imageId, data.version, data.api.fill, data.api.filter, data.api.adjust).name(data.imageName);
			//} else if (data.api.hasOwnProperty('wm')) {
			//  target = new Watermark(data.endpoint, data.imageId, data.version, data.api.wm, data.api.filter, data.api.adjust).name(data.imageName);
		} else if (data.api.hasOwnProperty('crop')) {
			target = new Crop(data.endpoint, data.imageId, data.version, data.api.crop, data.api.filter, data.api.adjust).name(data.imageName);
		}
		if (target === null) {
			return filter !== null ? filter : adjust;
		}
	}
	return target;
}

/**
 * @summary a WixImage is a configurable object that supports all the operations, filters and adjustments supported by Wix Media Platform
 * @param {String} baseUrl the base URL where the image is hosted
 * @param {String} imageId the id of the image to manipulate
 * @param {String} name the name of the image to manipulate
 * @constructor WixImage
 */
function WixImage(baseUrl, imageId, name, version) {
	this.imageId = imageId.trim();
	this.endpoint = baseUrl.trim();
	this.name = name !== undefined ? name.trim() : name;
	this.version = version || "v1";
}

WixImage.prototype = {
	/** @lends WixImage */

	/**
	 * @summary Configures this image using the 'canvas' operation.
	 * @param {Object} [data=null] optional configuration data for this operation
	 * @param {Object} [filter=null] optional configuration data for image adjustments
	 * @param {Object} [adjust=null] optional configuration data for image filters
	 * @returns {Canvas}
	 * @memberOf WixImage#
	 * @method
	 */
	canvas: function (data, filter, adjust) {
		return new Canvas(this.endpoint, this.imageId, this.version, data, filter, adjust).name(this.name);
	},
	/**
	 * @summary Configures this image using the 'fill' operation.
	 * @param {Object} [data=null] optional configuration data for this operation
	 * @param {Object} [filter=null] optional configuration data for image adjustments
	 * @param {Object} [adjust=null] optional configuration data for image filters
	 * @returns {Fill}
	 * @memberOf WixImage#
	 * @method
	 */
	fill: function (data, filter, adjust) {
		return new Fill(this.endpoint, this.imageId, this.version, data, filter, adjust).name(this.name);
	},
	/**
	 * @summary Configures this image using the 'fit' operation.
	 * @param {Object} [data=null] optional configuration data for this operation
	 * @param {Object} [filter=null] optional configuration data for image adjustments
	 * @param {Object} [adjust=null] optional configuration data for image filters
	 * @returns {Fit}
	 * @memberOf WixImage#
	 * @method
	 */
	fit: function (data, filter, adjust) {
		return new Fit(this.endpoint, this.imageId, this.version, data, filter, adjust).name(this.name);
	},
	/**
	 * @summary Configures this image using the 'crop' operation.
	 * @param {Object} [data=null] optional configuration data for this operation
	 * @param {Object} [filter=null] optional configuration data for image adjustments
	 * @param {Object} [adjust=null] optional configuration data for image filters
	 * @returns {Crop}
	 * @memberOf WixImage#
	 * @method
	 */
	crop: function (data, filter, adjust) {
		return new Crop(this.endpoint, this.imageId, this.version, data, filter, adjust).name(this.name);
	}
	///**
	// * Configures this image using the 'wm' operation.
	// * @param {Object} [data=null] optional configuration data for this operation
	// * @param {Object} [filter=null] optional configuration data for image adjustments
	// * @param {Object} [adjust=null] optional configuration data for image filters
	// * @returns {Watermark}
	// * @memberOf WixImage#
	// * @method
	// */
	//wm: function (data, filter, adjust) {
	//  return new Watermark(this.endpoint, this.imageId, this.version, data, filter, adjust).name(this.name);
	//}
};

module.exports = {
	WixImage: WixImage,
	Defaults: Defaults,
	fromUrl: fromUrl
};

},{"./parser":4,"./utils":5}],4:[function(_dereq_,module,exports){
var extend = _dereq_("./utils").extend;

var adjustMap = {
    "br" : {auto : true, params: 1, adjust : true},
    "con" : {auto : true, params: 1, adjust : true},
    "sat" : {auto : true, params: 1, adjust : true},
    "hue" : {auto : true, params: 1, adjust : true},
    //"vib" : {auto : true, params: 1, adjust : true},
    "auto_adj" : {standalone : true, params: 0, adjust : true}
};
var filterMap = {
    "oil" : {standalone : true, params: 0, filter : true},
    "neg" : {standalone : true, params: 0, filter : true},
    "pix" : {params: 1, filter : true},
    //"pixfs" : {params: 1, filter : true},
    "blur" : {params: 1, filter : true},
    "shrp" : {params: 1, filter : true},
    "usm" : {auto : true, params: 3, filter : true}
};
var al = {auto : true, params: 1};
var rf = {params: 1};

var whq = {
    "w" : {params: 1},
    "h" : {params: 1},
    "q" : {params: 1, auto : true},
	"bl" : {standalone : true}
};

var canvasMap = {"al" : al, "c" : {params : 1}};
extend(canvasMap, whq);
extend(canvasMap, filterMap);
extend(canvasMap, adjustMap);

var fillMap = {"rf" : rf, "al" : al};
extend(fillMap, whq);
extend(fillMap, filterMap);
extend(fillMap, adjustMap);

var fitMap = {"rf" : rf};
extend(fitMap, whq);
extend(fitMap, filterMap);
extend(fitMap, adjustMap);

var cropMap = {"x" : {params: 1}, "y" : {params: 1}};
extend(cropMap, whq);
extend(cropMap, filterMap);
extend(cropMap, adjustMap);

//var wmMap = {"al" : al, "scl" : {params: 1}, "op" : {params: 1}, "wmid" : {params: 1}};
//extend(wmMap, whq);
//extend(wmMap, filterMap);
//extend(wmMap, adjustMap);

var keywords = {
    "crop" : true,
    "fit" : true,
    "fill" : true,
    "canvas" : true
    //"wm" : true
};

var tokenTypes = {
    UNDERSCORE : 1,
    KEYWORD : 2,
    VALUE : 3,
    AUTO_VALUE : 4,
    EOF : 5,
    PARAM : 6
};

function ImageURLTokenizer(url) {
    this.buffer = url.toLowerCase();
    this.offset = 0;
    this.len = this.buffer.length;
    this.states = {
        INITIAL : 1,
        AFTER_KEYWORD : 2,
        BEFORE_PARAM : 3,
        BEFORE_VALUE : 4
    };
    this.state = this.states.initial;
}

ImageURLTokenizer.prototype.isLetter = function(c) {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
};

ImageURLTokenizer.prototype.isNumber = function(c) {
    return c === 46 || (c >= 48 && c <= 57);
};

ImageURLTokenizer.prototype.nextToken = function() {
    while(this.offset < this.len) {
        var c = this.buffer.charCodeAt(this.offset);
        var start = this.offset;
        if(c === 44) { //comma
            this.offset++;
            this.state = this.states.BEFORE_PARAM;
            continue;
        }
        if(c === 47) { // /
            if(this.state === this.states.AFTER_KEYWORD) {
                this.offset++;
                continue;
            }
        }
        if(c === 32) { // space
            switch(this.state) {
                case this.states.AFTER_KEYWORD:
                case this.states.BEFORE_PARAM:
                    this.offset++;
                    continue;
            }
        }
        if(this.isLetter(c)) {
            this.offset++;
            do {
                c = this.buffer.charCodeAt(this.offset);
                if(!this.isLetter(c)) {
                    break;
                }
                this.offset++;
            } while(this.offset < this.len);

            var text = this.buffer.slice(start, this.offset);
            if(keywords[text]) {
                this.state = this.states.AFTER_KEYWORD;
                return {
                    start : start,
                    end : this.offset,
                    type : tokenTypes.KEYWORD,
                    keyword : text
                };
            }
            if(this.state === this.states.AFTER_KEYWORD || this.state === this.states.VALUE) {
                if (text === "auto") {
                    return {
                        start: start,
                        end: this.offset,
                        type: tokenTypes.AUTO_VALUE
                    };
                }
            }
            if(this.state === this.states.AFTER_KEYWORD || this.state === this.states.BEFORE_PARAM) {
                if (c === 95 || c === 44 || c === 47) { //_, ',', /
                    return {
                        start: start,
                        end: this.offset,
                        type: tokenTypes.PARAM,
                        text: text
                    };
                }
            }
            if(this.state === this.states.BEFORE_VALUE) {
                return {
                    start: start,
                    end: this.offset,
                    type: tokenTypes.VALUE,
                    value: text
                };
            }
            continue;
        }
        if(c === 95) { //underscore
            var retVal = {
                start : start,
                end : this.offset,
                type : tokenTypes.UNDERSCORE
            };
            this.state = this.states.BEFORE_VALUE;
            this.offset++;
            return retVal;
        }
        if(this.state === this.states.BEFORE_VALUE) {
            if (this.isNumber(c) || c === 45) { //decimal point,number or -
                this.offset++;
                do {
                    c = this.buffer.charCodeAt(this.offset);
                    if (!this.isNumber(c)) {
                        break;
                    }
                    this.offset++;
                } while (this.offset < this.len);

                return {
                    start: start,
                    end: this.offset,
                    type: tokenTypes.VALUE,
                    value: this.buffer.slice(start, this.offset)
                };
            }
        }
        this.state = this.states.INITIAL;
        this.offset++;
    }
    return {
        type : tokenTypes.EOF
    };
};

function ImageURLParser() {
    this.table = {};
    this.table.fit = fitMap;
    this.table.canvas = canvasMap;
    this.table.fill = fillMap;
    this.table.crop = cropMap;
    //this.table.wm = wmMap;
}

ImageURLParser.prototype.parse = function(url) {
    var tk = new ImageURLTokenizer(url), token, keyword, valueTable, param,
        rules, paramCount, paramBuffer, isAuto, isFilter, isAdjust;
    var api = {}, start = -1, last = -1, loop = true;
    api.filter = {};
    api.adjust = {};
    do {
        token = tk.nextToken();
        switch(token.type) {
            case tokenTypes.EOF:
                loop = false;
                break;
            case tokenTypes.KEYWORD:
                if(start === -1) {
                    start = token.start;
                }
                valueTable = this.table[token.keyword];
                if(valueTable === undefined) {
                    throw "Bad Image operation found: " + token.keyword;
                }
                api[token.keyword] = {};
                keyword = token.keyword;
                break;
            case tokenTypes.PARAM:
                if(valueTable === null || valueTable[token.text] === undefined) {
                    throw "unknown parameter: " + token.text;
                }
                rules = valueTable[token.text];
                if(rules === undefined) {
                    throw "unknown parameter: " + token.text;
                }
                if(rules.standalone) {
                    api[keyword][token.text] = null;
                    break;
                }
                param = token.text;
                paramCount = rules.params;
                isAuto = rules.auto;
                isFilter = rules.filter;
                isAdjust = rules.adjust;
                paramBuffer = [];
                break;
            case tokenTypes.VALUE:
                paramCount--;
                paramBuffer.push(token.value);
                if(paramCount === 0) {
                  if(isFilter) {
                    api.filter[param] = paramBuffer.join('_');
                  } else if(isAdjust) {
                    api.adjust[param] = paramBuffer.join('_');
                  } else {
                    api[keyword][param] = paramBuffer.join('_');
                  }
                }
                last = token.end;
                break;
            case tokenTypes.AUTO_VALUE:
                if(!isAuto) {
                    throw "auto not allowed for parameter: " + param;
                }
                api[keyword][param] = token.value;
                last = token.end;
                break;
        }

    } while(loop);

    //now, let's get the pieces
    var prefixes = url.substring(0, start - 1).split('/');
    var version = prefixes.pop();
    var imageId = prefixes.pop();
    var endpoint = prefixes.join('/');

    return {
        imageId : imageId,
        version : version,
        imageName : url.substring(last + 1),
        endpoint : endpoint,
        api : api
    };
};

var parser = new ImageURLParser();
module.exports.parse = function(url) {
    return parser.parse(url);
};

},{"./utils":5}],5:[function(_dereq_,module,exports){
module.exports.extend = function(destination, source) {
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
            destination[k] = source[k];
        }
    }
    return destination;
};

},{}]},{},[1])
(1)
});