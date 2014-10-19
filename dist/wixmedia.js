(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var extend = require("./utils").extend;

var adjustMap = {
    "br" : {auto : true, params: 1},
    "con" : {auto : true, params: 1},
    "sat" : {auto : true, params: 1},
    "hue" : {auto : true, params: 1},
    "vib" : {auto : true, params: 1},
    "auto" : {standalone : true, params: 0}
};
var filterMap = {
    "oil" : {standalone : true, params: 0},
    "neg" : {standalone : true, params: 0},
    "pix" : {params: 1},
    "pixfs" : {params: 1},
    "blur" : {params: 1},
    "sharpen" : {params: 3}
};
var a = {auto : true, params: 1};
var us = {auto : true, params: 3};
var whq = {
    "w" : {params: 1},
    "h" : {params: 1},
    "q" : {params: 1, auto : true}
};

var srzMap = {
    "a" : a,
    "us" : us
};
extend(srzMap, whq);

var srbMap = {"us" : us};
extend(srbMap, whq);

var canvasMap = {"a" : a};
extend(canvasMap, srzMap);

var fillMap = {};
extend(fillMap, srzMap);

var cropMap = {"x" : {params: 1}, "y" : {params: 1}};
extend(cropMap, srzMap);

var wmMap = {"a" : a, "scl" : {params: 1}, "op" : {params: 1}};
extend(wmMap, srzMap);

var keywords = {
    "adjust" : true,
    "filter" : true,
    "crop" : true,
    "srz" : true,
    "srb" : true,
    "fill" : true,
    "canvas" : true,
    "wm" : true
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
    this.table.adjust = adjustMap;
    this.table.filter = filterMap;
    this.table.srz = srzMap;
    this.table.srb = srbMap;
    this.table.canvas = canvasMap;
    this.table.fill = fillMap;
    this.table.crop = cropMap;
    this.table.wm = wmMap;
}

ImageURLParser.prototype.parse = function(url) {
    var tk = new ImageURLTokenizer(url), token, keyword, valueTable, param,
        rules, paramCount, paramBuffer, isAuto;
    var api = {}, start = -1, last = -1, loop = true;
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
                paramBuffer = [];
                break;
            case tokenTypes.VALUE:
                paramCount--;
                paramBuffer.push(token.value);
                if(paramCount === 0) {
                    api[keyword][param] = paramBuffer.join('_');
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
    var imageId = prefixes.pop();
    var endpoint = prefixes.join('/');

    return {
        imageId : imageId,
        imageName : url.substring(last + 1),
        endpoint : endpoint,
        api : api
    };
};

var parser = new ImageURLParser();
module.exports.parse = function(url) {
    return parser.parse(url);
};
},{"./utils":2}],2:[function(require,module,exports){
module.exports.extend = function(destination, source) {
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
            destination[k] = source[k];
        }
    }
    return destination;
};
},{}],3:[function(require,module,exports){
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

function ArtisticAPI(endpoint, imageId, imageName, opName, init) {
    this.endpoint = endpoint;
    this.imageId = imageId;
    this.imageName = imageName;
    this.opName = opName;
    this.options = {};
    if(init !== undefined) {
        for(var p in init) {
            if(init.hasOwnProperty(p)) {
                this.options[p] = init[p];
            }
        }
    }
}

ArtisticAPI.prototype.toUrl = function() {
    return this.endpoint + "/" + this.imageId + "/" + this.chainedUrl() + "/" + this.imageName;
};

ArtisticAPI.prototype.chainedUrl = function() {
    return outputParams(this.options, this.opName);
};

ArtisticAPI.prototype.hasOptions = function() {
    for(var a in this.options) {
        if(this.options.hasOwnProperty(a)) {
            return true;
        }
    }
    return false;
};

function AdjustAPI(endpoint, imageId, imageName, init) {
    ArtisticAPI.call(this, endpoint, imageId, imageName, "adjust", init);
}
extend(AdjustAPI.prototype, ArtisticAPI.prototype);

AdjustAPI.prototype.brightness = function(b) {
    this.options.br = b || DEFAULT_AUTO;
    return this;
};
AdjustAPI.prototype.br = AdjustAPI.prototype.brightness;

AdjustAPI.prototype.contrast = function(c) {
    this.options.con = c || DEFAULT_AUTO;
    return this;
};
AdjustAPI.prototype.con = AdjustAPI.prototype.contrast;

AdjustAPI.prototype.saturation = function(s) {
    this.options.sat = s || DEFAULT_AUTO;
    return this;
};
AdjustAPI.prototype.sat = AdjustAPI.prototype.saturation;

AdjustAPI.prototype.hue = function(h) {
    this.options.hue = h || DEFAULT_AUTO;
    return this;
};

AdjustAPI.prototype.vibrance = function(v) {
    this.options.vib = v || DEFAULT_AUTO;
    return this;
};
AdjustAPI.prototype.vib = AdjustAPI.prototype.vibrance;


AdjustAPI.prototype.auto = function(auto) {
    if(auto !== undefined && auto === false) {
        delete this.options.auto;
        return this;
    }
    this.options.auto = null;
    return this;
};

AdjustAPI.prototype.chainedUrl = function() {
    if(this.options.auto) {
        return this.opName + "/" + DEFAULT_AUTO;
    }
    return ArtisticAPI.prototype.chainedUrl.call(this);
};

function FilterAPI(endpoint, imageId, imageName, init) {
    ArtisticAPI.call(this, endpoint, imageId, imageName, "filter", init);
}

extend(FilterAPI.prototype, ArtisticAPI.prototype);

FilterAPI.prototype.oil = function(oil) {
    if(oil !== undefined && oil === false) {
        delete this.options.oil;
    } else {
        this.options.oil = null;
    }
    return this;
};

FilterAPI.prototype.negative = function(neg) {
    if(neg !== undefined && neg === false) {
        delete this.options.neg;
    } else {
        this.options.neg = null;
    }
    return this;
};
FilterAPI.prototype.neg = FilterAPI.prototype.negative;

FilterAPI.prototype.pixelate = function(pixels) {
    this.options.pix = pixels;
    return this;
};
FilterAPI.prototype.pix = FilterAPI.prototype.pixelate;

FilterAPI.prototype.pixelateFaces = function(pixels) {
    this.options.pixfs = pixels;
    return this;
};
FilterAPI.prototype.pixfs = FilterAPI.prototype.pixelateFaces;

FilterAPI.prototype.blur = function(pixels) {
    this.options.blur = pixels;
    return this;
};

FilterAPI.prototype.sharpen = function(r, a, t) {
    this.options.sharpen = outputSharpening(sharpenParams(r, a, t));
    return this;
};

function OperationMixin(endpoint, imageId, imageName, opName, init, filter, adjust) {
    this.endpoint = endpoint;
    this.imageId = imageId;
    this.imageName = imageName;
    this.opName = opName;
    this.operations = {};
    var that = this;
    this.adj = new AdjustAPI(null, null, null, adjust);
    this.adj.toUrl = function() {
        return that.toUrl();
    };
    this.adj[opName] = function() {
        return that;
    };
    this.adj.filter = function() {
        return that.filter();
    };
    this.fil = new FilterAPI(null, null, null, filter);
    this.fil[opName] = function() {
        return that;
    };
    this.fil.adjust = function() {
        return that.adjust();
    };
    this.fil.toUrl = function() {
        return that.toUrl();
    };
    if(init !== undefined) {
        for(var p in init) {
            if(init.hasOwnProperty(p)) {
                this.operations[p] = init[p];
            }
        }
    }
}
OperationMixin.prototype = {
    toUrl : function() {
        var out = this.endpoint + "/" + this.imageId + "/" + outputParams(this.operations, this.opName);
        if(this.adj.hasOptions()) {
            out += "/" + this.adj.chainedUrl();
        }
        if(this.fil.hasOptions()) {
            out += "/" + this.fil.chainedUrl();
        }
        return out + "/" + this.imageName;
    },
    filter : function() {
        return this.fil;
    },
    adjust : function() {
        return this.adj;
    }
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

function OpSrz(endpoint, imageId, imageName, init, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "srz", init, filter, adjust);
    WidthHeightQualityMixin.call(this);
    UnsharpMaskMixin.call(this);
}

extend(OpSrz.prototype, OperationMixin.prototype);
extend(OpSrz.prototype, WidthHeightQualityMixin.prototype);
extend(OpSrz.prototype, AlignmentMixin.prototype);
extend(OpSrz.prototype, UnsharpMaskMixin.prototype);

function OpSrb(endpoint, imageId, imageName, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "srb", filter, adjust);
}
extend(OpSrb.prototype, OperationMixin.prototype);
extend(OpSrb.prototype, WidthHeightQualityMixin.prototype);
extend(OpSrb.prototype, UnsharpMaskMixin.prototype);

function OpCanvas(endpoint, imageId, imageName, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "canvas", filter, adjust);
    this.anchor = this.alignment;
}

extend(OpCanvas.prototype, OperationMixin.prototype);
extend(OpCanvas.prototype, WidthHeightQualityMixin.prototype);
extend(OpCanvas.prototype, AlignmentMixin.prototype);

function OpFill(endpoint, imageId, imageName, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "fill", filter, adjust);
}
extend(OpFill.prototype, OperationMixin.prototype);
extend(OpFill.prototype, WidthHeightQualityMixin.prototype);

function OpCrop(endpoint, imageId, imageName, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "crop", filter, adjust);
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

function OpWm(endpoint, imageId, imageName, filter, adjust) {
    OperationMixin.call(this, endpoint, imageId, imageName, "wm", filter, adjust);
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

function handleUrl(url) {
    var data = parser.parse(url);
    var target = null, filter = null, adjust = null, aOptions = {}, fOptions = {};
    if(data.api.hasOwnProperty('filter')) {
        filter = new FilterAPI(data.endpoint, data.imageId, data.imageName, data.api.filter);
        fOptions = data.api.filter;
    } else if(data.api.hasOwnProperty('adjust')) {
        adjust = new AdjustAPI(data.endpoint, data.imageId, data.imageName, data.api.adjust);
        aOptions = data.api.adjust;
    }

    if(data.api.hasOwnProperty('srz')) {
        target = new OpSrz(data.endpoint, data.imageId, data.imageName, data.api.srz, fOptions, aOptions);
    } else if(data.api.hasOwnProperty('srb')) {
        target = new OpSrb(data.endpoint, data.imageId, data.imageName, data.api.srb, fOptions, aOptions);
    } else if(data.api.hasOwnProperty('canvas')) {
        target = new OpCanvas(data.endpoint, data.imageId, data.imageName, data.api.canvas, fOptions, aOptions);
    } else if(data.api.hasOwnProperty('fill')) {
        target = new OpFill(data.endpoint, data.imageId, data.imageName, data.api.fill, fOptions, aOptions);
    } else if(data.api.hasOwnProperty('wm')) {
        target = new OpWm(data.endpoint, data.imageId, data.imageName, data.api.wm, fOptions, aOptions);
    } else if(data.api.hasOwnProperty('crop')) {
        target = new OpCrop(data.endpoint, data.imageId, data.imageName, data.api.crop, fOptions, aOptions);
    }
    if(target === null) {
        return filter !== null ? filter : adjust;
    }
    return target;
}

module.exports = {
    endpoint : function(endpoint) {
        this._endpoint = endpoint;
    },
    fromUrl : function(url) {
        return handleUrl(url);
    },
    srz : function(imageId, imageName, data, filter, adjust) {
        return new OpSrz(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    srb : function(imageId, imageName, data, filter, adjust) {
        return new OpSrb(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    canvas : function(imageId, imageName, data, filter, adjust) {
        return new OpCanvas(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    fill : function(imageId, imageName, data, filter, adjust) {
        return new OpFill(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    crop : function(imageId, imageName, data, filter, adjust) {
        return new OpCrop(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    wm : function(imageId, imageName, data, filter, adjust) {
        return new OpWm(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    adjust : function(imageId, imageName, data, filter, adjust) {
        return new AdjustAPI(this._endpoint, imageId, imageName, data, filter, adjust);
    },
    filter : function(imageId, imageName, data, filter, adjust) {
        return new FilterAPI(this._endpoint, imageId, imageName, data, filter, adjust);
    },
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
},{"./parser":1,"./utils":2}]},{},[3]);