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