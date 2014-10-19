var extend = require("./utils").extend;
var parser = require("./parser");

var DEFAULT_QUALITY = 75;
var DEFAULT_USM_RADIUS = 0.50;
var DEFAULT_USM_THRESHOLD = 0.00;
var DEFAULT_USM_AMOUNT = 0.20;
var DEFAULT_AUTO = "auto";

var alignments = {
    CENTER : "c",
    CENTER_TOP : "t",
    TOP_LEFT : "tl",
    TOP_RIGHT : "tr",
    CENTER_BOTTOM : "b",
    BOTTOM_LEFT : "bl",
    BOTTOM_RIGHT : "br",
    CENTER_LEFT : "l",
    CENTER_RIGHT : "r",
    AUTO : DEFAULT_AUTO
};

var SRZ_ALIGNMENTS = { FACE_RECOGNITION : "f" };
extend(SRZ_ALIGNMENTS, alignments);

var CANVAS_ANCHORS = { ALL_FACES : "fs" };
extend(CANVAS_ANCHORS, alignments);

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
    brightness : function(b) {
        this.adjustments.br = b || DEFAULT_AUTO;
        return this;
    },
    contrast : function(c) {
        this.adjustments.con = c || DEFAULT_AUTO;
        return this;
    },
    saturation : function(s) {
        this.adjustments.sat = s || DEFAULT_AUTO;
        return this;
    },
    hue : function(h) {
        this.adjustments.hue = h || DEFAULT_AUTO;
        return this;
    },
    vibrance : function(v) {
        this.adjustments.vib = v || DEFAULT_AUTO;
        return this;
    },
    autoAdjust : function(auto) {
        if(auto !== undefined && auto === false) {
            delete this.adjustments.auto;
            return this;
        }
        this.adjustments.auto = null;
        return this;
    },
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
    oil : function(oil) {
        if(oil !== undefined && oil === false) {
            delete this.filters.oil;
        } else {
            this.filters.oil = null;
        }
        return this;
    },
    negative : function(neg) {
        if(neg !== undefined && neg === false) {
            delete this.filters.neg;
        } else {
            this.filters.neg = null;
        }
        return this;
    },
    pixelate : function(pixels) {
        this.filters.pix = pixels;
        return this;
    },
    pixelateFaces : function(pixels) {
        this.filters.pixfs = pixels;
        return this;
    },
    blur : function(pixels) {
        this.filters.blur = pixels;
        return this;
    },
    sharpen : function(r, a, t) {
        this.filters.sharpen = outputSharpening(sharpenParams(r, a, t));
        return this;
    },
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

function BaseMixin(endpoint, imageId, opName) {
    this.endpoint = endpoint;
    this.imageId = imageId;
    this.opName = opName;
}

BaseMixin.prototype = {
    name : function(name) {
        this.imageName = name;
        return this;
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


function WidthHeightQualityMixin() { }
WidthHeightQualityMixin.prototype = {
    width : function(w) {
        this.operations.w = w;
        return this;
    },
    height : function(h) {
        this.operations.h = h;
        return this;
    },
    size : function(w, h, q) {
        this.width(w);
        this.height(h);
        if(q !== undefined) {
            this.quality(q);
        }
        return this;
    },
    quality : function(q) {
        this.operations.q = q;
        return this;
    }
};
//add shorthand properties
WidthHeightQualityMixin.prototype.w = WidthHeightQualityMixin.prototype.width;
WidthHeightQualityMixin.prototype.h = WidthHeightQualityMixin.prototype.height;
WidthHeightQualityMixin.prototype.q = WidthHeightQualityMixin.prototype.quality;

function UnsharpMaskMixin() { }

UnsharpMaskMixin.prototype.unsharpMask = function(r, a, t) {
    this.operations.us = outputSharpening(sharpenParams(r, a, t));
    return this;
};
UnsharpMaskMixin.prototype.us = UnsharpMaskMixin.prototype.unsharpMask;

function AlignmentMixin() { }

AlignmentMixin.prototype = {
    alignment : function(a) {
        this.operations.a = a;
        return this;
    }
};
AlignmentMixin.prototype.a = AlignmentMixin.prototype.alignment;

function OpSrz(endpoint, imageId,  init, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "srz", init, filter, adjust);
    WidthHeightQualityMixin.call(this);
    UnsharpMaskMixin.call(this);
}

extend(OpSrz.prototype, OperationMixin.prototype);
extend(OpSrz.prototype, WidthHeightQualityMixin.prototype);
extend(OpSrz.prototype, AlignmentMixin.prototype);
extend(OpSrz.prototype, UnsharpMaskMixin.prototype);

function OpSrb(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "srb", filter, adjust);
}
extend(OpSrb.prototype, OperationMixin.prototype);
extend(OpSrb.prototype, WidthHeightQualityMixin.prototype);
extend(OpSrb.prototype, UnsharpMaskMixin.prototype);

function OpCanvas(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "canvas", filter, adjust);
    this.anchor = this.alignment;
}

extend(OpCanvas.prototype, OperationMixin.prototype);
extend(OpCanvas.prototype, WidthHeightQualityMixin.prototype);
extend(OpCanvas.prototype, AlignmentMixin.prototype);

function OpFill(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "fill", filter, adjust);
}
extend(OpFill.prototype, OperationMixin.prototype);
extend(OpFill.prototype, WidthHeightQualityMixin.prototype);

function OpCrop(endpoint, imageId,  filter, adjust) {
    OperationMixin.call(this, endpoint, imageId,  "crop", filter, adjust);
}
extend(OpCrop.prototype, OperationMixin.prototype);
extend(OpCrop.prototype, WidthHeightQualityMixin.prototype);

OpCrop.prototype.x = function(x) {
    this.operations.x = x;
    return this;
};

OpCrop.prototype.y = function(y) {
    this.operations.y = y;
    return this;
};

OpCrop.prototype.coords = function(x, y) {
    this.x(x);
    this.y(y);
    return this;
};

function OpWm(endpoint, imageId, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, "wm", filter, adjust);
}

extend(OpWm.prototype, OperationMixin.prototype);
extend(OpWm.prototype, AlignmentMixin.prototype);

OpWm.prototype.opacity = function(o) {
    this.operations.op = o;
    return this;
};
OpWm.prototype.op = OpWm.prototype.opacity;
OpWm.prototype.scale = function(s) {
    this.operations.scl = s;
    return this;
};
OpWm.prototype.scl = OpWm.prototype.scale;

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
        target = new OpSrz(data.endpoint, data.imageId, data.api.srz, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('srb')) {
        target = new OpSrb(data.endpoint, data.imageId, data.api.srb, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('canvas')) {
        target = new OpCanvas(data.endpoint, data.imageId, data.api.canvas, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('fill')) {
        target = new OpFill(data.endpoint, data.imageId, data.api.fill, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('wm')) {
        target = new OpWm(data.endpoint, data.imageId, data.api.wm, fOptions, aOptions).name(data.imageName);
    } else if(data.api.hasOwnProperty('crop')) {
        target = new OpCrop(data.endpoint, data.imageId, data.api.crop, fOptions, aOptions).name(data.imageName);
    }
    if(target === null) {
        return filter !== null ? filter : adjust;
    }
    return target;
}

function WixImage(endpoint, imageId) {
    this.imageId = imageId;
    this.endpoint = endpoint;
}

WixImage.prototype = {
    srz : function(data, filter, adjust) {
        return new OpSrz(this.endpoint, this.imageId, data, filter, adjust);
    },
    srb : function(data, filter, adjust) {
        return new OpSrb(this.endpoint, this.imageId, data, filter, adjust);
    },
    canvas : function(data, filter, adjust) {
        return new OpCanvas(this.endpoint, this.imageId, data, filter, adjust);
    },
    fill : function(data, filter, adjust) {
        return new OpFill(this.endpoint, this.imageId, data, filter, adjust);
    },
    crop : function(data, filter, adjust) {
        return new OpCrop(this.endpoint, this.imageId, data, filter, adjust);
    },
    wm : function(data, filter, adjust) {
        return new OpWm(this.endpoint, this.imageId, data, filter, adjust);
    },
    adjust : function(data, filter) {
        return new Adjustment(this.endpoint, this.imageId, data, filter);
    },
    filter : function(data, adjust) {
        return new Filter(this.endpoint, this.imageId, data, adjust);
    }
};


module.exports = {
    fromUrl : function(url) {
        return handleUrl(url);
    },
    WixImage : WixImage,
    SRZ : {
        Alignment : SRZ_ALIGNMENTS
    },
    WM : {
        Alignment : alignments
    },
    CANVAS : {
        ANCHORS : CANVAS_ANCHORS
    },
    Defaults : {
        QUALITY: DEFAULT_QUALITY,
        USM_RADIUS: DEFAULT_USM_RADIUS,
        USM_AMOUNT: DEFAULT_USM_AMOUNT,
        USM_THRESHOLD: DEFAULT_USM_THRESHOLD,
        AUTO : DEFAULT_AUTO
    }
};