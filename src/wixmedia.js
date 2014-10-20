var extend = require("./utils").extend;
var parser = require("./parser");

var DEFAULT_QUALITY = 75;
var DEFAULT_US_RADIUS = 0.50;
var DEFAULT_US_THRESHOLD = 0.00;
var DEFAULT_US_AMOUNT = 0.20;
var DEFAULT_AUTO = "auto";

function sharpenParams(r, a, t) {
    if(a === undefined && t === undefined && (r === undefined || r === DEFAULT_AUTO)) {
        return { auto : true};
    }
    return { r : r, a : a, t: t };
}

function outputSharpening(mask) {
    if(mask !== undefined) {
        return mask.auto === true ? DEFAULT_AUTO : mask.r + "_" + mask.a + "_" + mask.t;
    }
    return "";
}

function outputParams(params, name) {
    var out = "";
    for(var a in params) {
        if(params.hasOwnProperty(a)) {
            if(out.length > 0) {
                out += ",";
            }
            out += (params[a] !== null) ? (a + "_" + params[a]) : a;
        }
    }
    return name + "/" + out;
}

/**
 * This provides methods used for adjustment APIs. It's not meant to
 * be used directly.
 *
 * @mixin AdjustMixin
 */
function AdjustMixin(init) {
    this.adjustments = {};
    if(init !== undefined) {
        for(var a in init) {
            if(init.hasOwnProperty(a)) {
                this.adjustments[a] = init[a];
            }
        }
    }
}
AdjustMixin.prototype = {
    /**
     * brightness of the image. supports 'auto' or a numeric value between -100 and 100
     * @param {string|number} b a Number between -100 and 100 or 'auto'
     * @returns {*} the operation
     */
    brightness : function(b) {
        this.adjustments.br = b || DEFAULT_AUTO;
        return this;
    },
    /**
     * contrast of the image. supports 'auto' or a numeric value between -100 and 100
     * @param {string|number} c a Number between -100 and 100 or 'auto'
     * @returns {*} the operation
     */
    contrast : function(c) {
        this.adjustments.con = c || DEFAULT_AUTO;
        return this;
    },
    /**
     * saturation of the image. supports 'auto' or a numeric value between -100 and 100
     * @param {string|number} s a Number between -100 and 100 or 'auto'
     * @returns {*} the operation
     */
    saturation : function(s) {
        this.adjustments.sat = s || DEFAULT_AUTO;
        return this;
    },
    /**
     * hue of the image. supports 'auto' or a numeric value between -100 and 100
     * @param {string|number} h a Number between -100 and 100 or 'auto'
     * @returns {*} the operation
     */
    hue : function(h) {
        this.adjustments.hue = h || DEFAULT_AUTO;
        return this;
    },
    /**
     * vibrance of the image. supports 'auto' or a numeric value between -100 and 100
     * @param {string|number} v a Number between -100 and 100 or 'auto'
     * @returns {*} the operation
     */
    vibrance : function(v) {
        this.adjustments.vib = v || DEFAULT_AUTO;
        return this;
    },
    /**
     * Automatically adjusts the brightness, contrast, hue, vibrance and saturation
     * @param {boolean} [auto=true] enabled
     * @returns {*} the operation
     */
    autoAdjust : function(auto) {
        if(auto !== undefined && auto === false) {
            delete this.adjustments.auto;
            return this;
        }
        this.adjustments.auto = null;
        return this;
    },
    /**
     * Indicates that this operation has adjustment parameters
     * @returns {boolean} true if adjustments are set
     */
    hasAdjustments : function() {
        for(var a in this.adjustments) {
            if(this.adjustments.hasOwnProperty(a)) {
                return true;
            }
        }
        return false;
    }
};
AdjustMixin.prototype.br = AdjustMixin.prototype.brightness;
AdjustMixin.prototype.con = AdjustMixin.prototype.contrast;
AdjustMixin.prototype.sat = AdjustMixin.prototype.saturation;
AdjustMixin.prototype.vib = AdjustMixin.prototype.vibrance;

/**
 * This provides methods used for filter APIs. It's not meant to
 * be used directly.
 * @mixin FilterMixin
 */
function FilterMixin(init) {
    this.filters = {};
    if(init !== undefined) {
        for(var f in init) {
            if(init.hasOwnProperty(f)) {
                this.filters[f] = init[f];
            }
        }
    }
}
FilterMixin.prototype = {
    /**
     * Applies an oil paint effect to the image.
     * @param {Number} [oil=true] enabled
     * @returns {*} the operation
     */
    oil : function(oil) {
        if(oil !== undefined && oil === false) {
            delete this.filters.oil;
        } else {
            this.filters.oil = null;
        }
        return this;
    },
    /**
     * Negates the colors of the image.
     * @param {Number} [neg=true] enabled
     * @returns {*} the operation
     */
    negative : function(neg) {
        if(neg !== undefined && neg === false) {
            delete this.filters.neg;
        } else {
            this.filters.neg = null;
        }
        return this;
    },
    /**
     * Applies a pixelate effect to the image.
     * @param {number} pixels the width of pixelation squares, in pixels
     * @returns {*} the operation
     */
    pixelate : function(pixels) {
        this.filters.pix = pixels;
        return this;
    },
    /**
     * Applies a pixelate effect to faces in the image.
     * @param {number} pixels the width of pixelation squares, in pixels
     * @returns {*} the operation
     */
    pixelateFaces : function(pixels) {
        this.filters.pixfs = pixels;
        return this;
    },
    /**
     * Applies a blur effect to the image.
     * @param {number} blur percent to blur the image
     * @returns {*} the operation
     */
    blur : function(blur) {
        this.filters.blur = blur;
        return this;
    },
    /**
     * Sharpens the image using radius, amount & threshold parameters
     * @param {number} radius sharpening mask radius, 0 to image size
     * @param {number} amount sharpening mask amount, 0 to 100
     * @param {number} amount shapening mask threshold, 0 to 255
     * @returns {*} the operation
     */
    sharpen : function(radius, amount, threshold) {
        this.filters.sharpen = outputSharpening(sharpenParams(radius, amount, threshold));
        return this;
    },
    /**
     * Indicates that this operation has filter parameters
     * @returns {boolean} true if filters are set
     */
    hasFilters : function() {
        for(var a in this.filters) {
            if(this.filters.hasOwnProperty(a)) {
                return true;
            }
        }
        return false;
    }
};

FilterMixin.prototype.pix = FilterMixin.prototype.pixelate;
FilterMixin.prototype.neg = FilterMixin.prototype.negative;
FilterMixin.prototype.pixfs = FilterMixin.prototype.pixelateFaces;

/**
 * This provides methods used for filter APIs. It's not meant to
 * be used directly.
 * @mixin BaseMixin
 */
function BaseMixin(endpoint, imageId, opName) {
    this.endpoint = endpoint;
    this.imageId = imageId;
    this.opName = opName;
}

BaseMixin.prototype = {
    /**
     * Sets the name of the image to return
     * @param {string} name the name of the image
     * @returns {*} the operation
     */
    name : function(name) {
        this.imageName = name;
        return this;
    },
    /**
     * Returns the URL of the configured image
     * @returns {String} the URL of the image
     */
    toUrl : function() {
        throw "Not implemented";
    }
};


function OperationMixin(endpoint, imageId, opName, init, filters, adjustments) {
    BaseMixin.call(this, endpoint, imageId, opName);
    AdjustMixin.call(this, adjustments);
    FilterMixin.call(this, filters);
    this.operations = {};
    if(init !== undefined) {
        for(var p in init) {
            if(init.hasOwnProperty(p)) {
                this.operations[p] = init[p];
            }
        }
    }
}

extend(OperationMixin.prototype, BaseMixin.prototype);
extend(OperationMixin.prototype, AdjustMixin.prototype);
extend(OperationMixin.prototype, FilterMixin.prototype);

OperationMixin.prototype.toUrl = function() {
    var out = this.endpoint + "/" + this.imageId + "/" + outputParams(this.operations, this.opName);
    if(this.hasAdjustments()) {
        out += "/" + outputParams(this.adjustments, "adjust");
    }
    if(this.hasFilters()) {
        out += "/" + outputParams(this.filters, "filter");
    }
    return out + "/" + this.imageName;
};

/**
 * This provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin WidthHeightQualityMixin
 */
function WidthHeightQualityMixin() { }
WidthHeightQualityMixin.prototype = {
    /**
     * The width constraint
     * @param {Number} w a number greater than 0
     * @returns {*} the operation
     */
    width : function(w) {
        this.operations.w = w;
        return this;
    },
    /**
     * The height constraint
     * @param {Number} h a number greater than 0
     * @returns {*} the operation
     */
    height : function(h) {
        this.operations.h = h;
        return this;
    },
    /**
     * The shorthand to set width and height
     * @param {Number} w a number greater than 0
     * @param {Number} h a number greater than 0
     * @returns {*} the operation
     */
    size : function(w, h, q) {
        this.width(w);
        this.height(h);
        if(q !== undefined) {
            this.quality(q);
        }
        return this;
    },
    /**
     * The quality constraint, if the image is a jpg
     * @param {Number} [q=75] a number from 0 to 100
     * @returns {*} the operation
     */
    quality : function(q) {
        this.operations.q = q || 75;
        return this;
    }
};
//add shorthand properties
WidthHeightQualityMixin.prototype.w = WidthHeightQualityMixin.prototype.width;
WidthHeightQualityMixin.prototype.h = WidthHeightQualityMixin.prototype.height;
WidthHeightQualityMixin.prototype.q = WidthHeightQualityMixin.prototype.quality;

/**
 * This provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin UnsharpMaskMixin
 */
function UnsharpMaskMixin() { }

/**
 * Sharpens the image using radius, amount & threshold parameters
 * @param {number} radius the unsharp mask radius. default value: 0.50
 * @param {number} amount the unsharp mask amount. default value: 0.20.
 * @param {number} amount the unsharp mask threshold. default value: 0.00.
 * @returns {*} the operation
 */
UnsharpMaskMixin.prototype.unsharpMask = function(r, a, t) {
    this.operations.us = outputSharpening(sharpenParams(r, a, t));
    return this;
};
UnsharpMaskMixin.prototype.us = UnsharpMaskMixin.prototype.unsharpMask;

/**
 * This provides methods used for operation APIs. It's not meant to be used directly.
 * @mixin AlignmentMixin
 */
function AlignmentMixin() { }

AlignmentMixin.prototype = {
    /**
     * Sets the alignment value for this operation
     * @param {Alignments} a the alignment value
     * @returns {*} the operation
     */
    alignment : function(a) {
        this.operations.a = a;
        return this;
    }
};
AlignmentMixin.prototype.a = AlignmentMixin.prototype.alignment;

/**
 * Scaled resize without crop. Most useful shortcut for simple image optimization,
 * while maintaining good balance between output size and quality
 * @constructor Srz
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 * @mixes AlignmentMixin
 * @mixes UnsharpMaskMixin
 */
function Srz(endpoint, imageId,  init, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "srz", init, filter, adjust);
    WidthHeightQualityMixin.call(this);
    UnsharpMaskMixin.call(this);
}

extend(Srz.prototype, OperationMixin.prototype);
extend(Srz.prototype, WidthHeightQualityMixin.prototype);
extend(Srz.prototype, AlignmentMixin.prototype);
extend(Srz.prototype, UnsharpMaskMixin.prototype);

/**
 * Resizes the image to fit within the width and height boundaries without cropping or scaling the image,
 * but will not increase the size of the image if it is smaller than the output size.
 * The resulting image will maintain the same aspect ratio of the input image.
 * @constructor Srb
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 * @mixes UnsharpMaskMixin
 */
function Srb(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "srb", filter, adjust);
}
extend(Srb.prototype, OperationMixin.prototype);
extend(Srb.prototype, WidthHeightQualityMixin.prototype);
extend(Srb.prototype, UnsharpMaskMixin.prototype);

/**
 * Resizes the image canvas, filling the width and height boundaries and crops any excess image data.
 * The resulting image will match the width and height constraints without scaling the image.
 * @constructor Canvas
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 */
function Canvas(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "canvas", filter, adjust);
}

extend(Canvas.prototype, OperationMixin.prototype);
extend(Canvas.prototype, WidthHeightQualityMixin.prototype);
extend(Canvas.prototype, AlignmentMixin.prototype);

/**
 * Sets the anchor value for this operation
 * @param {Alignments} a the alignment value
 * @returns {*} the operation
 * @function
 */
Canvas.prototype.anchor = Canvas.prototype.alignment;

/**
 * Create an image with the exact given width and height while retaining original proportions.
 * Use only part of the image that fills the given dimensions. Only part of the original image
 * might be visible if the required proportions are different than the original ones.
 * @constructor Fill
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 */
function Fill(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "fill", filter, adjust);
}
extend(Fill.prototype, OperationMixin.prototype);
extend(Fill.prototype, WidthHeightQualityMixin.prototype);

/**
 * Crops the image based on the supplied coordinates, starting at the x, y pixel
 * coordinates along with the width and height parameters.
 * @constructor Crop
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes WidthHeightQualityMixin
 */
function Crop(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "crop", filter, adjust);
}
extend(Crop.prototype, OperationMixin.prototype);
extend(Crop.prototype, WidthHeightQualityMixin.prototype);

/**
 * The x value of the crop
 * @param {number} x the x value
 * @returns {*} the operation
 */
Crop.prototype.x = function(x) {
    this.operations.x = x;
    return this;
};

/**
 * The y value of the crop
 * @param {number} y the y value
 * @returns {*} the operation
 */
Crop.prototype.y = function(y) {
    this.operations.y = y;
    return this;
};

/**
 * A shorthand for setting the x and y coordinates for this crop
 * @param {number} x the x value
 * @param {number} y the y value
 * @returns {Crop}
 */
Crop.prototype.coords = function(x, y) {
    this.x(x);
    this.y(y);
    return this;
};

/**
 * Enables users to apply watermark such as copyright notice in order to protect their images.
 * @constructor Watermark
 * @mixes BaseMixin
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes AlignmentMixin
 */
function Watermark(endpoint, imageId, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, "wm", filter, adjust);
}

extend(Watermark.prototype, OperationMixin.prototype);
extend(Watermark.prototype, AlignmentMixin.prototype);

/**
 * The Watermark opacity.
 * @param {number} o a number between 0 and 100
 * @returns {Watermark}
 */
Watermark.prototype.opacity = function(o) {
    this.operations.op = o;
    return this;
};
Watermark.prototype.op = Watermark.prototype.opacity;
/**
 * Watermark horizontal scaling as percents of the requested image width
 * @param {number} o a percent between 0 and 100
 * @returns {Watermark}
 */
Watermark.prototype.scale = function(s) {
    this.operations.scl = s;
    return this;
};
Watermark.prototype.scl = Watermark.prototype.scale;

/**
 * Applies an adjustment to an image. Parameters values can be either specific or set to “auto”.
 * An auto parameter without any values performs a general auto-enhancement.
 * @constructor Adjustment
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes AlignmentMixin
 */
function Adjustment(endpoint, imageId, init, filter) {
    BaseMixin.call(this, endpoint, imageId, "adjust");
    AdjustMixin.call(this, init);
    FilterMixin.call(this, filter);
}
extend(Adjustment.prototype, BaseMixin.prototype);
extend(Adjustment.prototype, AdjustMixin.prototype);
extend(Adjustment.prototype, FilterMixin.prototype);

Adjustment.prototype.toUrl = function() {
    var out = this.endpoint + "/" + this.imageId + "/" + outputParams(this.adjustments, this.opName);
    if(this.hasFilters()) {
        out += "/" + outputParams(this.filters, "filter");
    }
    return out + "/" + this.imageName;
};

/**
 * Applies effects to an image
 * @constructor Filter
 * @mixes AdjustMixin
 * @mixes FilterMixin
 * @mixes AlignmentMixin
 */
function Filter(endpoint, imageId, init, adjust) {
    BaseMixin.call(this, endpoint, imageId, "filter");
    FilterMixin.call(this, init);
    AdjustMixin.call(this, adjust);
}
extend(Filter.prototype, BaseMixin.prototype);
extend(Filter.prototype, FilterMixin.prototype);
extend(Filter.prototype, AdjustMixin.prototype);
Filter.prototype.toUrl = function() {
    var out = this.endpoint + "/" + this.imageId + "/" + outputParams(this.filters, this.opName);
    if(this.hasAdjustments()) {
        out += "/" + outputParams(this.adjustments, "adjust");
    }
    return out + "/" + this.imageName;
};

function handleUrl(url) {
    var data = parser.parse(url);
    var target = null, filter = null, adjust = null, aOptions = {}, fOptions = {};
    if(data.api.hasOwnProperty('filter')) {
        filter = new Filter(data.endpoint, data.imageId, data.api.filter).name(data.imageName);
        fOptions = data.api.filter;
    }
    if(data.api.hasOwnProperty('adjust')) {
        adjust = new Adjustment(data.endpoint, data.imageId, data.api.adjust, fOptions).name(data.imageName);
        aOptions = data.api.adjust;
    }

    if(data.api.hasOwnProperty('srz')) {
        target = new Srz(data.endpoint, data.imageId, data.api.srz, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('srb')) {
        target = new Srb(data.endpoint, data.imageId, data.api.srb, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('canvas')) {
        target = new Canvas(data.endpoint, data.imageId, data.api.canvas, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('fill')) {
        target = new Fill(data.endpoint, data.imageId, data.api.fill, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('wm')) {
        target = new Watermark(data.endpoint, data.imageId, data.api.wm, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('crop')) {
        target = new Crop(data.endpoint, data.imageId, data.api.crop, fOptions, aOptions).name(data.imageName);
    }
    if(target === null) {
        return filter !== null ? filter : adjust;
    }
    return target;
}

/**
 * a WixImage is a configurable object that supports all the operations, filters and adjustments supported by Wix Media Services
 * @param {String} baseUrl the base URL where the image is hosted
 * @param {String} imageId the id of the image to manipulate
 * @constructor WixImage
 */
function WixImage(baseUrl, imageId) {
    this.imageId = imageId;
    this.endpoint = baseUrl;
}

WixImage.prototype = {
    /** @lends WixImage */

    /**
     * Configures this image using the 'srz' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Srz}
     * @memberOf WixImage#
     * @method
     */
    srz : function(data, filter, adjust) {
        return new Srz(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Configures this image using the 'srb' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Srb}
     * @memberOf WixImage#
     * @method
     */
    srb : function(data, filter, adjust) {
        return new Srb(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Configures this image using the 'canvas' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Canvas}
     * @memberOf WixImage#
     * @method
     */
    canvas : function(data, filter, adjust) {
        return new Canvas(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Configures this image using the 'fill' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Fill}
     * @memberOf WixImage#
     * @method
     */
    fill : function(data, filter, adjust) {
        return new Fill(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Configures this image using the 'crop' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Crop}
     * @memberOf WixImage#
     * @method
     */
    crop : function(data, filter, adjust) {
        return new Crop(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Configures this image using the 'wm' operation.
     * @param {Object} [data=null] optional configuration data for this operation
     * @param {Object} [filter=null] optional configuration data for image adjustments
     * @param {Object} [adjust=null] optional configuration data for image filters
     * @returns {Watermark}
     * @memberOf WixImage#
     * @method
     */
    wm : function(data, filter, adjust) {
        return new Watermark(this.endpoint, this.imageId, data, filter, adjust);
    },
    /**
     * Applies adjustments to this image
     * @param {Object} [data=null] optional configuration data for image adjustments
     * @param {Object} [filter=null] optional configuration data for image filters
     * @returns {Adjustment}
     * @memberOf WixImage#
     * @method
     */
    adjust : function(data, filter) {
        return new Adjustment(this.endpoint, this.imageId, data, filter);
    },
    /**
     * Applies filters to this image
     * @param {Object} [data=null] optional configuration data for this image's filters
     * @param {Object} [adjust=null] optional configuration data for image adjustments
     * @returns {Filter}
     * @memberOf WixImage#
     * @method
     */
    filter : function(data, adjust) {
        return new Filter(this.endpoint, this.imageId, data, adjust);
    }
};

/**
 * Constants for use with image operations
 * @class
 */
function Defaults() {
    /**
     * Alignments for use with srz and watermark
     * @readonly
     * @enum
     */
    this.Alignment = {
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
    };
    /**
     * Anchors for use with canvas
     * @borrows Defaults#Alignment as Defaults#Anchor
     */
    this.Anchor = this.Alignment;

    /**
     * The default quality for jpgs
     * @type {number}
     * @readonly
     * @member
     */
    this.QUALITY = DEFAULT_QUALITY;

    /**
     * The default unsharpen radius
     * @type {number}
     * @readonly
     * @member
     */
    this.US_RADIUS = DEFAULT_US_RADIUS;

    /**
     * The default unsharpen threshold
     * @type {number}
     * @readonly
     * @member
     */
    this.US_AMOUNT = DEFAULT_US_AMOUNT;

    /**
     * The default unsharpen amount
     * @type {number}
     * @readonly
     * @member
     */
    this.US_THRESHOLD = DEFAULT_US_THRESHOLD;

    /**
     * Default value 'auto'
     * @type {string}
     */
    this.AUTO = DEFAULT_AUTO;
}

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
    fromUrl : function(url) {
        return handleUrl(url);
    },
    /**
     * Creates a new {@link WixImage}
     * @param {String} baseUrl the base URL where the image is hosted
     * @param {String} imageId the id of the image to manipulate
     * @returns {WixImage} a new {@link WixImage}
     */
    WixImage : function(baseUrl, imageId) {
        return new WixImage(baseUrl, imageId);
    },

    /**
     * Image constants for use with Wix Media Services
     * @type {Defaults}
     */
    Defaults : new Defaults()
};