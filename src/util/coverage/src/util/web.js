function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/util/web.js']) {
  _$jscoverage['/util/web.js'] = {};
  _$jscoverage['/util/web.js'].lineData = [];
  _$jscoverage['/util/web.js'].lineData[6] = 0;
  _$jscoverage['/util/web.js'].lineData[7] = 0;
  _$jscoverage['/util/web.js'].lineData[8] = 0;
  _$jscoverage['/util/web.js'].lineData[9] = 0;
  _$jscoverage['/util/web.js'].lineData[30] = 0;
  _$jscoverage['/util/web.js'].lineData[32] = 0;
  _$jscoverage['/util/web.js'].lineData[35] = 0;
  _$jscoverage['/util/web.js'].lineData[37] = 0;
  _$jscoverage['/util/web.js'].lineData[40] = 0;
  _$jscoverage['/util/web.js'].lineData[48] = 0;
  _$jscoverage['/util/web.js'].lineData[58] = 0;
  _$jscoverage['/util/web.js'].lineData[59] = 0;
  _$jscoverage['/util/web.js'].lineData[61] = 0;
  _$jscoverage['/util/web.js'].lineData[62] = 0;
  _$jscoverage['/util/web.js'].lineData[64] = 0;
  _$jscoverage['/util/web.js'].lineData[65] = 0;
  _$jscoverage['/util/web.js'].lineData[68] = 0;
  _$jscoverage['/util/web.js'].lineData[69] = 0;
  _$jscoverage['/util/web.js'].lineData[70] = 0;
  _$jscoverage['/util/web.js'].lineData[73] = 0;
  _$jscoverage['/util/web.js'].lineData[74] = 0;
  _$jscoverage['/util/web.js'].lineData[75] = 0;
  _$jscoverage['/util/web.js'].lineData[77] = 0;
  _$jscoverage['/util/web.js'].lineData[78] = 0;
  _$jscoverage['/util/web.js'].lineData[80] = 0;
  _$jscoverage['/util/web.js'].lineData[88] = 0;
  _$jscoverage['/util/web.js'].lineData[92] = 0;
  _$jscoverage['/util/web.js'].lineData[93] = 0;
  _$jscoverage['/util/web.js'].lineData[95] = 0;
  _$jscoverage['/util/web.js'].lineData[96] = 0;
  _$jscoverage['/util/web.js'].lineData[109] = 0;
  _$jscoverage['/util/web.js'].lineData[110] = 0;
  _$jscoverage['/util/web.js'].lineData[111] = 0;
  _$jscoverage['/util/web.js'].lineData[113] = 0;
  _$jscoverage['/util/web.js'].lineData[114] = 0;
  _$jscoverage['/util/web.js'].lineData[115] = 0;
  _$jscoverage['/util/web.js'].lineData[119] = 0;
  _$jscoverage['/util/web.js'].lineData[121] = 0;
  _$jscoverage['/util/web.js'].lineData[131] = 0;
  _$jscoverage['/util/web.js'].lineData[132] = 0;
  _$jscoverage['/util/web.js'].lineData[133] = 0;
  _$jscoverage['/util/web.js'].lineData[134] = 0;
  _$jscoverage['/util/web.js'].lineData[135] = 0;
  _$jscoverage['/util/web.js'].lineData[136] = 0;
  _$jscoverage['/util/web.js'].lineData[138] = 0;
  _$jscoverage['/util/web.js'].lineData[139] = 0;
  _$jscoverage['/util/web.js'].lineData[140] = 0;
  _$jscoverage['/util/web.js'].lineData[141] = 0;
  _$jscoverage['/util/web.js'].lineData[147] = 0;
  _$jscoverage['/util/web.js'].lineData[149] = 0;
  _$jscoverage['/util/web.js'].lineData[150] = 0;
  _$jscoverage['/util/web.js'].lineData[151] = 0;
  _$jscoverage['/util/web.js'].lineData[154] = 0;
  _$jscoverage['/util/web.js'].lineData[155] = 0;
  _$jscoverage['/util/web.js'].lineData[157] = 0;
  _$jscoverage['/util/web.js'].lineData[158] = 0;
  _$jscoverage['/util/web.js'].lineData[159] = 0;
  _$jscoverage['/util/web.js'].lineData[160] = 0;
  _$jscoverage['/util/web.js'].lineData[162] = 0;
  _$jscoverage['/util/web.js'].lineData[164] = 0;
  _$jscoverage['/util/web.js'].lineData[165] = 0;
  _$jscoverage['/util/web.js'].lineData[172] = 0;
  _$jscoverage['/util/web.js'].lineData[175] = 0;
  _$jscoverage['/util/web.js'].lineData[176] = 0;
  _$jscoverage['/util/web.js'].lineData[177] = 0;
  _$jscoverage['/util/web.js'].lineData[181] = 0;
  _$jscoverage['/util/web.js'].lineData[184] = 0;
  _$jscoverage['/util/web.js'].lineData[185] = 0;
  _$jscoverage['/util/web.js'].lineData[186] = 0;
  _$jscoverage['/util/web.js'].lineData[187] = 0;
  _$jscoverage['/util/web.js'].lineData[190] = 0;
  _$jscoverage['/util/web.js'].lineData[192] = 0;
  _$jscoverage['/util/web.js'].lineData[193] = 0;
  _$jscoverage['/util/web.js'].lineData[194] = 0;
  _$jscoverage['/util/web.js'].lineData[195] = 0;
  _$jscoverage['/util/web.js'].lineData[201] = 0;
  _$jscoverage['/util/web.js'].lineData[205] = 0;
  _$jscoverage['/util/web.js'].lineData[208] = 0;
  _$jscoverage['/util/web.js'].lineData[209] = 0;
  _$jscoverage['/util/web.js'].lineData[211] = 0;
  _$jscoverage['/util/web.js'].lineData[215] = 0;
  _$jscoverage['/util/web.js'].lineData[216] = 0;
  _$jscoverage['/util/web.js'].lineData[217] = 0;
  _$jscoverage['/util/web.js'].lineData[219] = 0;
  _$jscoverage['/util/web.js'].lineData[220] = 0;
  _$jscoverage['/util/web.js'].lineData[222] = 0;
  _$jscoverage['/util/web.js'].lineData[225] = 0;
  _$jscoverage['/util/web.js'].lineData[234] = 0;
  _$jscoverage['/util/web.js'].lineData[235] = 0;
  _$jscoverage['/util/web.js'].lineData[238] = 0;
  _$jscoverage['/util/web.js'].lineData[239] = 0;
}
if (! _$jscoverage['/util/web.js'].functionData) {
  _$jscoverage['/util/web.js'].functionData = [];
  _$jscoverage['/util/web.js'].functionData[0] = 0;
  _$jscoverage['/util/web.js'].functionData[1] = 0;
  _$jscoverage['/util/web.js'].functionData[2] = 0;
  _$jscoverage['/util/web.js'].functionData[3] = 0;
  _$jscoverage['/util/web.js'].functionData[4] = 0;
  _$jscoverage['/util/web.js'].functionData[5] = 0;
  _$jscoverage['/util/web.js'].functionData[6] = 0;
  _$jscoverage['/util/web.js'].functionData[7] = 0;
  _$jscoverage['/util/web.js'].functionData[8] = 0;
  _$jscoverage['/util/web.js'].functionData[9] = 0;
  _$jscoverage['/util/web.js'].functionData[10] = 0;
  _$jscoverage['/util/web.js'].functionData[11] = 0;
  _$jscoverage['/util/web.js'].functionData[12] = 0;
  _$jscoverage['/util/web.js'].functionData[13] = 0;
  _$jscoverage['/util/web.js'].functionData[14] = 0;
  _$jscoverage['/util/web.js'].functionData[15] = 0;
  _$jscoverage['/util/web.js'].functionData[16] = 0;
  _$jscoverage['/util/web.js'].functionData[17] = 0;
  _$jscoverage['/util/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/util/web.js'].branchData) {
  _$jscoverage['/util/web.js'].branchData = {};
  _$jscoverage['/util/web.js'].branchData['11'] = [];
  _$jscoverage['/util/web.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['24'] = [];
  _$jscoverage['/util/web.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'] = [];
  _$jscoverage['/util/web.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'][3] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['58'] = [];
  _$jscoverage['/util/web.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['64'] = [];
  _$jscoverage['/util/web.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['77'] = [];
  _$jscoverage['/util/web.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['88'] = [];
  _$jscoverage['/util/web.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['92'] = [];
  _$jscoverage['/util/web.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['109'] = [];
  _$jscoverage['/util/web.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['113'] = [];
  _$jscoverage['/util/web.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['134'] = [];
  _$jscoverage['/util/web.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['139'] = [];
  _$jscoverage['/util/web.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['150'] = [];
  _$jscoverage['/util/web.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['154'] = [];
  _$jscoverage['/util/web.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['158'] = [];
  _$jscoverage['/util/web.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['162'] = [];
  _$jscoverage['/util/web.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['175'] = [];
  _$jscoverage['/util/web.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['184'] = [];
  _$jscoverage['/util/web.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['193'] = [];
  _$jscoverage['/util/web.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['206'] = [];
  _$jscoverage['/util/web.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['209'] = [];
  _$jscoverage['/util/web.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['215'] = [];
  _$jscoverage['/util/web.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['234'] = [];
  _$jscoverage['/util/web.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/util/web.js'].branchData['234'][1].init(7740, 12, 'supportEvent');
function visit267_234_1(result) {
  _$jscoverage['/util/web.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['215'][1].init(931, 20, 'doScroll && notframe');
function visit266_215_1(result) {
  _$jscoverage['/util/web.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['209'][1].init(30, 25, 'win.frameElement === null');
function visit265_209_1(result) {
  _$jscoverage['/util/web.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['206'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit264_206_1(result) {
  _$jscoverage['/util/web.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['193'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit263_193_1(result) {
  _$jscoverage['/util/web.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['184'][1].init(373, 18, 'standardEventModel');
function visit262_184_1(result) {
  _$jscoverage['/util/web.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['175'][2].init(128, 27, 'doc.readyState === COMPLETE');
function visit261_175_2(result) {
  _$jscoverage['/util/web.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['175'][1].init(120, 35, '!doc || doc.readyState === COMPLETE');
function visit260_175_1(result) {
  _$jscoverage['/util/web.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['162'][1].init(24, 12, 'e.stack || e');
function visit259_162_1(result) {
  _$jscoverage['/util/web.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['158'][1].init(236, 20, 'i < callbacks.length');
function visit258_158_1(result) {
  _$jscoverage['/util/web.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['154'][1].init(90, 21, 'win && win.setTimeout');
function visit257_154_1(result) {
  _$jscoverage['/util/web.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['150'][1].init(14, 8, 'domReady');
function visit256_150_1(result) {
  _$jscoverage['/util/web.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['139'][1].init(211, 4, 'node');
function visit255_139_1(result) {
  _$jscoverage['/util/web.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['134'][1].init(22, 27, '++retryCount > POLL_RETIRES');
function visit254_134_1(result) {
  _$jscoverage['/util/web.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['113'][1].init(28, 12, 'e.stack || e');
function visit253_113_1(result) {
  _$jscoverage['/util/web.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['109'][1].init(18, 8, 'domReady');
function visit252_109_1(result) {
  _$jscoverage['/util/web.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['92'][1].init(273, 14, 'win.execScript');
function visit251_92_1(result) {
  _$jscoverage['/util/web.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['88'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit250_88_1(result) {
  _$jscoverage['/util/web.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['77'][2].init(728, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit249_77_2(result) {
  _$jscoverage['/util/web.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['77'][1].init(720, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit248_77_1(result) {
  _$jscoverage['/util/web.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['64'][1].init(51, 13, 'win.DOMParser');
function visit247_64_1(result) {
  _$jscoverage['/util/web.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['58'][1].init(48, 20, 'data.documentElement');
function visit246_58_1(result) {
  _$jscoverage['/util/web.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][3].init(109, 17, 'obj == obj.window');
function visit245_48_3(result) {
  _$jscoverage['/util/web.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][2].init(94, 11, 'obj != null');
function visit244_48_2(result) {
  _$jscoverage['/util/web.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][1].init(94, 32, 'obj != null && obj == obj.window');
function visit243_48_1(result) {
  _$jscoverage['/util/web.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['24'][1].init(482, 37, 'doc.attachEvent || standardEventModel');
function visit242_24_1(result) {
  _$jscoverage['/util/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['11'][1].init(52, 18, 'win.document || {}');
function visit241_11_1(result) {
  _$jscoverage['/util/web.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/web.js'].functionData[0]++;
  _$jscoverage['/util/web.js'].lineData[7]++;
  var util = require('./base');
  _$jscoverage['/util/web.js'].lineData[8]++;
  var logger = S.getLogger('util');
  _$jscoverage['/util/web.js'].lineData[9]++;
  var win = S.Env.host, undef, doc = visit241_11_1(win.document || {}), docElem = doc.documentElement, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = visit242_24_1(doc.attachEvent || standardEventModel), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[1]++;
  _$jscoverage['/util/web.js'].lineData[30]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[2]++;
  _$jscoverage['/util/web.js'].lineData[32]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[3]++;
  _$jscoverage['/util/web.js'].lineData[35]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[4]++;
  _$jscoverage['/util/web.js'].lineData[37]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/util/web.js'].lineData[40]++;
  util.mix(util, {
  isWindow: function(obj) {
  _$jscoverage['/util/web.js'].functionData[5]++;
  _$jscoverage['/util/web.js'].lineData[48]++;
  return visit243_48_1(visit244_48_2(obj != null) && visit245_48_3(obj == obj.window));
}, 
  parseXml: function(data) {
  _$jscoverage['/util/web.js'].functionData[6]++;
  _$jscoverage['/util/web.js'].lineData[58]++;
  if (visit246_58_1(data.documentElement)) {
    _$jscoverage['/util/web.js'].lineData[59]++;
    return data;
  }
  _$jscoverage['/util/web.js'].lineData[61]++;
  var xml;
  _$jscoverage['/util/web.js'].lineData[62]++;
  try {
    _$jscoverage['/util/web.js'].lineData[64]++;
    if (visit247_64_1(win.DOMParser)) {
      _$jscoverage['/util/web.js'].lineData[65]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/util/web.js'].lineData[68]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/util/web.js'].lineData[69]++;
      xml.async = false;
      _$jscoverage['/util/web.js'].lineData[70]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/util/web.js'].lineData[73]++;
  logger.error('parseXML error :');
  _$jscoverage['/util/web.js'].lineData[74]++;
  logger.error(e);
  _$jscoverage['/util/web.js'].lineData[75]++;
  xml = undef;
}
  _$jscoverage['/util/web.js'].lineData[77]++;
  if (visit248_77_1(!xml || visit249_77_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/util/web.js'].lineData[78]++;
    util.error('Invalid XML: ' + data);
  }
  _$jscoverage['/util/web.js'].lineData[80]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/util/web.js'].functionData[7]++;
  _$jscoverage['/util/web.js'].lineData[88]++;
  if (visit250_88_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/util/web.js'].lineData[92]++;
    if (visit251_92_1(win.execScript)) {
      _$jscoverage['/util/web.js'].lineData[93]++;
      win.execScript(data);
    } else {
      _$jscoverage['/util/web.js'].lineData[95]++;
      (function(data) {
  _$jscoverage['/util/web.js'].functionData[8]++;
  _$jscoverage['/util/web.js'].lineData[96]++;
  win['eval'].call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/util/web.js'].functionData[9]++;
  _$jscoverage['/util/web.js'].lineData[109]++;
  if (visit252_109_1(domReady)) {
    _$jscoverage['/util/web.js'].lineData[110]++;
    try {
      _$jscoverage['/util/web.js'].lineData[111]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/util/web.js'].lineData[113]++;
  S.log(visit253_113_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[114]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[10]++;
  _$jscoverage['/util/web.js'].lineData[115]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/util/web.js'].lineData[119]++;
    callbacks.push(fn);
  }
  _$jscoverage['/util/web.js'].lineData[121]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/util/web.js'].functionData[11]++;
  _$jscoverage['/util/web.js'].lineData[131]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/util/web.js'].lineData[132]++;
  var retryCount = 1;
  _$jscoverage['/util/web.js'].lineData[133]++;
  var timer = util.later(function() {
  _$jscoverage['/util/web.js'].functionData[12]++;
  _$jscoverage['/util/web.js'].lineData[134]++;
  if (visit254_134_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/util/web.js'].lineData[135]++;
    timer.cancel();
    _$jscoverage['/util/web.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/util/web.js'].lineData[138]++;
  var node = doc.getElementById(id);
  _$jscoverage['/util/web.js'].lineData[139]++;
  if (visit255_139_1(node)) {
    _$jscoverage['/util/web.js'].lineData[140]++;
    fn(node);
    _$jscoverage['/util/web.js'].lineData[141]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/util/web.js'].lineData[147]++;
  util.parserXML = util.parseXml;
  _$jscoverage['/util/web.js'].lineData[149]++;
  function fireReady() {
    _$jscoverage['/util/web.js'].functionData[13]++;
    _$jscoverage['/util/web.js'].lineData[150]++;
    if (visit256_150_1(domReady)) {
      _$jscoverage['/util/web.js'].lineData[151]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[154]++;
    if (visit257_154_1(win && win.setTimeout)) {
      _$jscoverage['/util/web.js'].lineData[155]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/util/web.js'].lineData[157]++;
    domReady = 1;
    _$jscoverage['/util/web.js'].lineData[158]++;
    for (var i = 0; visit258_158_1(i < callbacks.length); i++) {
      _$jscoverage['/util/web.js'].lineData[159]++;
      try {
        _$jscoverage['/util/web.js'].lineData[160]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[162]++;
  S.log(visit259_162_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[164]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[14]++;
  _$jscoverage['/util/web.js'].lineData[165]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/util/web.js'].lineData[172]++;
  function bindReady() {
    _$jscoverage['/util/web.js'].functionData[15]++;
    _$jscoverage['/util/web.js'].lineData[175]++;
    if (visit260_175_1(!doc || visit261_175_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/util/web.js'].lineData[176]++;
      fireReady();
      _$jscoverage['/util/web.js'].lineData[177]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[181]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/util/web.js'].lineData[184]++;
    if (visit262_184_1(standardEventModel)) {
      _$jscoverage['/util/web.js'].lineData[185]++;
      var domReady = function() {
  _$jscoverage['/util/web.js'].functionData[16]++;
  _$jscoverage['/util/web.js'].lineData[186]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/util/web.js'].lineData[187]++;
  fireReady();
};
      _$jscoverage['/util/web.js'].lineData[190]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/util/web.js'].lineData[192]++;
      var stateChange = function() {
  _$jscoverage['/util/web.js'].functionData[17]++;
  _$jscoverage['/util/web.js'].lineData[193]++;
  if (visit263_193_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/util/web.js'].lineData[194]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/util/web.js'].lineData[195]++;
    fireReady();
  }
};
      _$jscoverage['/util/web.js'].lineData[201]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/util/web.js'].lineData[205]++;
      var notframe, doScroll = visit264_206_1(docElem && docElem.doScroll);
      _$jscoverage['/util/web.js'].lineData[208]++;
      try {
        _$jscoverage['/util/web.js'].lineData[209]++;
        notframe = (visit265_209_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[211]++;
  notframe = false;
}
      _$jscoverage['/util/web.js'].lineData[215]++;
      if (visit266_215_1(doScroll && notframe)) {
        _$jscoverage['/util/web.js'].lineData[216]++;
        var readyScroll = function() {
  _$jscoverage['/util/web.js'].functionData[18]++;
  _$jscoverage['/util/web.js'].lineData[217]++;
  try {
    _$jscoverage['/util/web.js'].lineData[219]++;
    doScroll('left');
    _$jscoverage['/util/web.js'].lineData[220]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/util/web.js'].lineData[222]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/util/web.js'].lineData[225]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/util/web.js'].lineData[234]++;
  if (visit267_234_1(supportEvent)) {
    _$jscoverage['/util/web.js'].lineData[235]++;
    bindReady();
  }
  _$jscoverage['/util/web.js'].lineData[238]++;
  try {
    _$jscoverage['/util/web.js'].lineData[239]++;
    doc.execCommand('BackgroundImageCache', false, true);
  }  catch (e) {
}
});
