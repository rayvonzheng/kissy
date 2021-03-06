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
if (! _$jscoverage['/router.js']) {
  _$jscoverage['/router.js'] = {};
  _$jscoverage['/router.js'].lineData = [];
  _$jscoverage['/router.js'].lineData[5] = 0;
  _$jscoverage['/router.js'].lineData[6] = 0;
  _$jscoverage['/router.js'].lineData[7] = 0;
  _$jscoverage['/router.js'].lineData[8] = 0;
  _$jscoverage['/router.js'].lineData[9] = 0;
  _$jscoverage['/router.js'].lineData[10] = 0;
  _$jscoverage['/router.js'].lineData[11] = 0;
  _$jscoverage['/router.js'].lineData[12] = 0;
  _$jscoverage['/router.js'].lineData[13] = 0;
  _$jscoverage['/router.js'].lineData[14] = 0;
  _$jscoverage['/router.js'].lineData[15] = 0;
  _$jscoverage['/router.js'].lineData[16] = 0;
  _$jscoverage['/router.js'].lineData[17] = 0;
  _$jscoverage['/router.js'].lineData[18] = 0;
  _$jscoverage['/router.js'].lineData[19] = 0;
  _$jscoverage['/router.js'].lineData[21] = 0;
  _$jscoverage['/router.js'].lineData[23] = 0;
  _$jscoverage['/router.js'].lineData[24] = 0;
  _$jscoverage['/router.js'].lineData[25] = 0;
  _$jscoverage['/router.js'].lineData[30] = 0;
  _$jscoverage['/router.js'].lineData[31] = 0;
  _$jscoverage['/router.js'].lineData[35] = 0;
  _$jscoverage['/router.js'].lineData[36] = 0;
  _$jscoverage['/router.js'].lineData[38] = 0;
  _$jscoverage['/router.js'].lineData[43] = 0;
  _$jscoverage['/router.js'].lineData[44] = 0;
  _$jscoverage['/router.js'].lineData[45] = 0;
  _$jscoverage['/router.js'].lineData[46] = 0;
  _$jscoverage['/router.js'].lineData[47] = 0;
  _$jscoverage['/router.js'].lineData[48] = 0;
  _$jscoverage['/router.js'].lineData[50] = 0;
  _$jscoverage['/router.js'].lineData[54] = 0;
  _$jscoverage['/router.js'].lineData[55] = 0;
  _$jscoverage['/router.js'].lineData[56] = 0;
  _$jscoverage['/router.js'].lineData[58] = 0;
  _$jscoverage['/router.js'].lineData[59] = 0;
  _$jscoverage['/router.js'].lineData[60] = 0;
  _$jscoverage['/router.js'].lineData[61] = 0;
  _$jscoverage['/router.js'].lineData[63] = 0;
  _$jscoverage['/router.js'].lineData[64] = 0;
  _$jscoverage['/router.js'].lineData[65] = 0;
  _$jscoverage['/router.js'].lineData[66] = 0;
  _$jscoverage['/router.js'].lineData[67] = 0;
  _$jscoverage['/router.js'].lineData[68] = 0;
  _$jscoverage['/router.js'].lineData[69] = 0;
  _$jscoverage['/router.js'].lineData[70] = 0;
  _$jscoverage['/router.js'].lineData[71] = 0;
  _$jscoverage['/router.js'].lineData[73] = 0;
  _$jscoverage['/router.js'].lineData[78] = 0;
  _$jscoverage['/router.js'].lineData[81] = 0;
  _$jscoverage['/router.js'].lineData[82] = 0;
  _$jscoverage['/router.js'].lineData[83] = 0;
  _$jscoverage['/router.js'].lineData[85] = 0;
  _$jscoverage['/router.js'].lineData[86] = 0;
  _$jscoverage['/router.js'].lineData[87] = 0;
  _$jscoverage['/router.js'].lineData[88] = 0;
  _$jscoverage['/router.js'].lineData[89] = 0;
  _$jscoverage['/router.js'].lineData[90] = 0;
  _$jscoverage['/router.js'].lineData[91] = 0;
  _$jscoverage['/router.js'].lineData[92] = 0;
  _$jscoverage['/router.js'].lineData[93] = 0;
  _$jscoverage['/router.js'].lineData[94] = 0;
  _$jscoverage['/router.js'].lineData[95] = 0;
  _$jscoverage['/router.js'].lineData[96] = 0;
  _$jscoverage['/router.js'].lineData[98] = 0;
  _$jscoverage['/router.js'].lineData[99] = 0;
  _$jscoverage['/router.js'].lineData[100] = 0;
  _$jscoverage['/router.js'].lineData[101] = 0;
  _$jscoverage['/router.js'].lineData[105] = 0;
  _$jscoverage['/router.js'].lineData[107] = 0;
  _$jscoverage['/router.js'].lineData[112] = 0;
  _$jscoverage['/router.js'].lineData[115] = 0;
  _$jscoverage['/router.js'].lineData[116] = 0;
  _$jscoverage['/router.js'].lineData[117] = 0;
  _$jscoverage['/router.js'].lineData[118] = 0;
  _$jscoverage['/router.js'].lineData[119] = 0;
  _$jscoverage['/router.js'].lineData[121] = 0;
  _$jscoverage['/router.js'].lineData[122] = 0;
  _$jscoverage['/router.js'].lineData[133] = 0;
  _$jscoverage['/router.js'].lineData[136] = 0;
  _$jscoverage['/router.js'].lineData[140] = 0;
  _$jscoverage['/router.js'].lineData[149] = 0;
  _$jscoverage['/router.js'].lineData[156] = 0;
  _$jscoverage['/router.js'].lineData[157] = 0;
  _$jscoverage['/router.js'].lineData[158] = 0;
  _$jscoverage['/router.js'].lineData[159] = 0;
  _$jscoverage['/router.js'].lineData[161] = 0;
  _$jscoverage['/router.js'].lineData[173] = 0;
  _$jscoverage['/router.js'].lineData[174] = 0;
  _$jscoverage['/router.js'].lineData[175] = 0;
  _$jscoverage['/router.js'].lineData[176] = 0;
  _$jscoverage['/router.js'].lineData[177] = 0;
  _$jscoverage['/router.js'].lineData[178] = 0;
  _$jscoverage['/router.js'].lineData[179] = 0;
  _$jscoverage['/router.js'].lineData[182] = 0;
  _$jscoverage['/router.js'].lineData[183] = 0;
  _$jscoverage['/router.js'].lineData[189] = 0;
  _$jscoverage['/router.js'].lineData[191] = 0;
  _$jscoverage['/router.js'].lineData[192] = 0;
  _$jscoverage['/router.js'].lineData[195] = 0;
  _$jscoverage['/router.js'].lineData[197] = 0;
  _$jscoverage['/router.js'].lineData[200] = 0;
  _$jscoverage['/router.js'].lineData[201] = 0;
  _$jscoverage['/router.js'].lineData[209] = 0;
  _$jscoverage['/router.js'].lineData[210] = 0;
  _$jscoverage['/router.js'].lineData[211] = 0;
  _$jscoverage['/router.js'].lineData[219] = 0;
  _$jscoverage['/router.js'].lineData[220] = 0;
  _$jscoverage['/router.js'].lineData[221] = 0;
  _$jscoverage['/router.js'].lineData[222] = 0;
  _$jscoverage['/router.js'].lineData[225] = 0;
  _$jscoverage['/router.js'].lineData[233] = 0;
  _$jscoverage['/router.js'].lineData[234] = 0;
  _$jscoverage['/router.js'].lineData[235] = 0;
  _$jscoverage['/router.js'].lineData[236] = 0;
  _$jscoverage['/router.js'].lineData[237] = 0;
  _$jscoverage['/router.js'].lineData[238] = 0;
  _$jscoverage['/router.js'].lineData[239] = 0;
  _$jscoverage['/router.js'].lineData[240] = 0;
  _$jscoverage['/router.js'].lineData[243] = 0;
  _$jscoverage['/router.js'].lineData[250] = 0;
  _$jscoverage['/router.js'].lineData[251] = 0;
  _$jscoverage['/router.js'].lineData[252] = 0;
  _$jscoverage['/router.js'].lineData[260] = 0;
  _$jscoverage['/router.js'].lineData[261] = 0;
  _$jscoverage['/router.js'].lineData[262] = 0;
  _$jscoverage['/router.js'].lineData[263] = 0;
  _$jscoverage['/router.js'].lineData[266] = 0;
  _$jscoverage['/router.js'].lineData[269] = 0;
  _$jscoverage['/router.js'].lineData[270] = 0;
  _$jscoverage['/router.js'].lineData[271] = 0;
  _$jscoverage['/router.js'].lineData[273] = 0;
  _$jscoverage['/router.js'].lineData[274] = 0;
  _$jscoverage['/router.js'].lineData[275] = 0;
  _$jscoverage['/router.js'].lineData[276] = 0;
  _$jscoverage['/router.js'].lineData[279] = 0;
  _$jscoverage['/router.js'].lineData[281] = 0;
  _$jscoverage['/router.js'].lineData[284] = 0;
  _$jscoverage['/router.js'].lineData[287] = 0;
  _$jscoverage['/router.js'].lineData[289] = 0;
  _$jscoverage['/router.js'].lineData[291] = 0;
  _$jscoverage['/router.js'].lineData[292] = 0;
  _$jscoverage['/router.js'].lineData[294] = 0;
  _$jscoverage['/router.js'].lineData[297] = 0;
  _$jscoverage['/router.js'].lineData[300] = 0;
  _$jscoverage['/router.js'].lineData[301] = 0;
  _$jscoverage['/router.js'].lineData[302] = 0;
  _$jscoverage['/router.js'].lineData[303] = 0;
  _$jscoverage['/router.js'].lineData[305] = 0;
  _$jscoverage['/router.js'].lineData[319] = 0;
  _$jscoverage['/router.js'].lineData[320] = 0;
  _$jscoverage['/router.js'].lineData[321] = 0;
  _$jscoverage['/router.js'].lineData[323] = 0;
  _$jscoverage['/router.js'].lineData[326] = 0;
  _$jscoverage['/router.js'].lineData[334] = 0;
  _$jscoverage['/router.js'].lineData[335] = 0;
  _$jscoverage['/router.js'].lineData[336] = 0;
  _$jscoverage['/router.js'].lineData[339] = 0;
  _$jscoverage['/router.js'].lineData[347] = 0;
  _$jscoverage['/router.js'].lineData[348] = 0;
  _$jscoverage['/router.js'].lineData[354] = 0;
  _$jscoverage['/router.js'].lineData[355] = 0;
  _$jscoverage['/router.js'].lineData[357] = 0;
  _$jscoverage['/router.js'].lineData[358] = 0;
  _$jscoverage['/router.js'].lineData[360] = 0;
  _$jscoverage['/router.js'].lineData[363] = 0;
  _$jscoverage['/router.js'].lineData[369] = 0;
  _$jscoverage['/router.js'].lineData[370] = 0;
  _$jscoverage['/router.js'].lineData[372] = 0;
  _$jscoverage['/router.js'].lineData[377] = 0;
  _$jscoverage['/router.js'].lineData[378] = 0;
  _$jscoverage['/router.js'].lineData[379] = 0;
  _$jscoverage['/router.js'].lineData[380] = 0;
  _$jscoverage['/router.js'].lineData[384] = 0;
  _$jscoverage['/router.js'].lineData[386] = 0;
  _$jscoverage['/router.js'].lineData[388] = 0;
  _$jscoverage['/router.js'].lineData[389] = 0;
  _$jscoverage['/router.js'].lineData[390] = 0;
  _$jscoverage['/router.js'].lineData[393] = 0;
  _$jscoverage['/router.js'].lineData[394] = 0;
  _$jscoverage['/router.js'].lineData[395] = 0;
  _$jscoverage['/router.js'].lineData[396] = 0;
  _$jscoverage['/router.js'].lineData[397] = 0;
  _$jscoverage['/router.js'].lineData[398] = 0;
  _$jscoverage['/router.js'].lineData[399] = 0;
  _$jscoverage['/router.js'].lineData[402] = 0;
  _$jscoverage['/router.js'].lineData[404] = 0;
  _$jscoverage['/router.js'].lineData[411] = 0;
  _$jscoverage['/router.js'].lineData[412] = 0;
  _$jscoverage['/router.js'].lineData[415] = 0;
  _$jscoverage['/router.js'].lineData[416] = 0;
  _$jscoverage['/router.js'].lineData[420] = 0;
  _$jscoverage['/router.js'].lineData[421] = 0;
  _$jscoverage['/router.js'].lineData[424] = 0;
  _$jscoverage['/router.js'].lineData[427] = 0;
  _$jscoverage['/router.js'].lineData[428] = 0;
  _$jscoverage['/router.js'].lineData[429] = 0;
  _$jscoverage['/router.js'].lineData[430] = 0;
}
if (! _$jscoverage['/router.js'].functionData) {
  _$jscoverage['/router.js'].functionData = [];
  _$jscoverage['/router.js'].functionData[0] = 0;
  _$jscoverage['/router.js'].functionData[1] = 0;
  _$jscoverage['/router.js'].functionData[2] = 0;
  _$jscoverage['/router.js'].functionData[3] = 0;
  _$jscoverage['/router.js'].functionData[4] = 0;
  _$jscoverage['/router.js'].functionData[5] = 0;
  _$jscoverage['/router.js'].functionData[6] = 0;
  _$jscoverage['/router.js'].functionData[7] = 0;
  _$jscoverage['/router.js'].functionData[8] = 0;
  _$jscoverage['/router.js'].functionData[9] = 0;
  _$jscoverage['/router.js'].functionData[10] = 0;
  _$jscoverage['/router.js'].functionData[11] = 0;
  _$jscoverage['/router.js'].functionData[12] = 0;
  _$jscoverage['/router.js'].functionData[13] = 0;
  _$jscoverage['/router.js'].functionData[14] = 0;
  _$jscoverage['/router.js'].functionData[15] = 0;
  _$jscoverage['/router.js'].functionData[16] = 0;
  _$jscoverage['/router.js'].functionData[17] = 0;
  _$jscoverage['/router.js'].functionData[18] = 0;
  _$jscoverage['/router.js'].functionData[19] = 0;
  _$jscoverage['/router.js'].functionData[20] = 0;
  _$jscoverage['/router.js'].functionData[21] = 0;
  _$jscoverage['/router.js'].functionData[22] = 0;
}
if (! _$jscoverage['/router.js'].branchData) {
  _$jscoverage['/router.js'].branchData = {};
  _$jscoverage['/router.js'].branchData['19'] = [];
  _$jscoverage['/router.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['35'] = [];
  _$jscoverage['/router.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['44'] = [];
  _$jscoverage['/router.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['46'] = [];
  _$jscoverage['/router.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['60'] = [];
  _$jscoverage['/router.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['64'] = [];
  _$jscoverage['/router.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['87'] = [];
  _$jscoverage['/router.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['94'] = [];
  _$jscoverage['/router.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['99'] = [];
  _$jscoverage['/router.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['121'] = [];
  _$jscoverage['/router.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['125'] = [];
  _$jscoverage['/router.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['127'] = [];
  _$jscoverage['/router.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['128'] = [];
  _$jscoverage['/router.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/router.js'].branchData['128'][3] = new BranchData();
  _$jscoverage['/router.js'].branchData['157'] = [];
  _$jscoverage['/router.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['174'] = [];
  _$jscoverage['/router.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['175'] = [];
  _$jscoverage['/router.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['176'] = [];
  _$jscoverage['/router.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['177'] = [];
  _$jscoverage['/router.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['182'] = [];
  _$jscoverage['/router.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['191'] = [];
  _$jscoverage['/router.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['200'] = [];
  _$jscoverage['/router.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['220'] = [];
  _$jscoverage['/router.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['221'] = [];
  _$jscoverage['/router.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['234'] = [];
  _$jscoverage['/router.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['236'] = [];
  _$jscoverage['/router.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['237'] = [];
  _$jscoverage['/router.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['239'] = [];
  _$jscoverage['/router.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['261'] = [];
  _$jscoverage['/router.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['262'] = [];
  _$jscoverage['/router.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['273'] = [];
  _$jscoverage['/router.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['278'] = [];
  _$jscoverage['/router.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['291'] = [];
  _$jscoverage['/router.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['300'] = [];
  _$jscoverage['/router.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['302'] = [];
  _$jscoverage['/router.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['320'] = [];
  _$jscoverage['/router.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['335'] = [];
  _$jscoverage['/router.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['336'] = [];
  _$jscoverage['/router.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['347'] = [];
  _$jscoverage['/router.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['348'] = [];
  _$jscoverage['/router.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['354'] = [];
  _$jscoverage['/router.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['355'] = [];
  _$jscoverage['/router.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['363'] = [];
  _$jscoverage['/router.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['379'] = [];
  _$jscoverage['/router.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['388'] = [];
  _$jscoverage['/router.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['389'] = [];
  _$jscoverage['/router.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['395'] = [];
  _$jscoverage['/router.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['395'][2] = new BranchData();
  _$jscoverage['/router.js'].branchData['398'] = [];
  _$jscoverage['/router.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['402'] = [];
  _$jscoverage['/router.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['411'] = [];
  _$jscoverage['/router.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['415'] = [];
  _$jscoverage['/router.js'].branchData['415'][1] = new BranchData();
}
_$jscoverage['/router.js'].branchData['415'][1].init(1652, 8, 'callback');
function visit79_415_1(result) {
  _$jscoverage['/router.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['411'][1].init(1562, 12, 'triggerRoute');
function visit78_411_1(result) {
  _$jscoverage['/router.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['402'][1].init(1144, 18, 'needReplaceHistory');
function visit77_402_1(result) {
  _$jscoverage['/router.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['398'][1].init(474, 45, 'supportHistoryPushState && utils.hasVid(href)');
function visit76_398_1(result) {
  _$jscoverage['/router.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['395'][2].init(295, 44, 'getVidFromUrlWithHash(href) !== viewUniqueId');
function visit75_395_2(result) {
  _$jscoverage['/router.js'].branchData['395'][2].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['395'][1].init(267, 72, '!supportHistoryPushState && getVidFromUrlWithHash(href) !== viewUniqueId');
function visit74_395_1(result) {
  _$jscoverage['/router.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['389'][1].init(22, 18, '!getUrlForRouter()');
function visit73_389_1(result) {
  _$jscoverage['/router.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['388'][1].init(493, 7, 'useHash');
function visit72_388_1(result) {
  _$jscoverage['/router.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['379'][1].init(81, 23, 'supportHistoryPushState');
function visit71_379_1(result) {
  _$jscoverage['/router.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['363'][1].init(705, 42, '!utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit70_363_1(result) {
  _$jscoverage['/router.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['355'][1].init(26, 41, 'utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit69_355_1(result) {
  _$jscoverage['/router.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['354'][1].init(216, 11, 'hashIsValid');
function visit68_354_1(result) {
  _$jscoverage['/router.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['348'][1].init(18, 23, 'supportHistoryPushState');
function visit67_348_1(result) {
  _$jscoverage['/router.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['347'][1].init(426, 8, '!useHash');
function visit66_347_1(result) {
  _$jscoverage['/router.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['336'][1].init(21, 34, 'callback && callback.call(exports)');
function visit65_336_1(result) {
  _$jscoverage['/router.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['335'][1].init(14, 7, 'started');
function visit64_335_1(result) {
  _$jscoverage['/router.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['320'][1].init(14, 12, 'opts.urlRoot');
function visit63_320_1(result) {
  _$jscoverage['/router.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['302'][1].init(183, 4, '!vid');
function visit62_302_1(result) {
  _$jscoverage['/router.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['300'][1].init(93, 25, 'e.newURL || location.href');
function visit61_300_1(result) {
  _$jscoverage['/router.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['291'][1].init(121, 6, '!state');
function visit60_291_1(result) {
  _$jscoverage['/router.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['278'][1].init(80, 45, 'vid !== viewsHistory[viewsHistory.length - 1]');
function visit59_278_1(result) {
  _$jscoverage['/router.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['273'][1].init(77, 45, 'vid === viewsHistory[viewsHistory.length - 2]');
function visit58_273_1(result) {
  _$jscoverage['/router.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['262'][1].init(18, 28, 'routes[i].path === routePath');
function visit57_262_1(result) {
  _$jscoverage['/router.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['261'][1].init(45, 5, 'i < l');
function visit56_261_1(result) {
  _$jscoverage['/router.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['239'][1].init(75, 19, '!r.callbacks.length');
function visit55_239_1(result) {
  _$jscoverage['/router.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['237'][1].init(22, 8, 'callback');
function visit54_237_1(result) {
  _$jscoverage['/router.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['236'][1].init(50, 20, 'r.path === routePath');
function visit53_236_1(result) {
  _$jscoverage['/router.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['234'][1].init(42, 6, 'i >= 0');
function visit52_234_1(result) {
  _$jscoverage['/router.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['221'][1].init(18, 21, 'routes[i].match(path)');
function visit51_221_1(result) {
  _$jscoverage['/router.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['220'][1].init(45, 5, 'i < l');
function visit50_220_1(result) {
  _$jscoverage['/router.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['200'][1].init(1154, 25, 'opts && opts.triggerRoute');
function visit49_200_1(result) {
  _$jscoverage['/router.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['191'][1].init(22, 23, 'supportHistoryPushState');
function visit48_191_1(result) {
  _$jscoverage['/router.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['182'][1].init(195, 48, '!globalConfig.useHash && supportHistoryPushState');
function visit47_182_1(result) {
  _$jscoverage['/router.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['177'][1].init(18, 8, '!replace');
function visit46_177_1(result) {
  _$jscoverage['/router.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['176'][1].init(88, 26, 'getUrlForRouter() !== path');
function visit45_176_1(result) {
  _$jscoverage['/router.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['175'][1].init(52, 21, 'opts.replace || false');
function visit44_175_1(result) {
  _$jscoverage['/router.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['174'][1].init(17, 10, 'opts || {}');
function visit43_174_1(result) {
  _$jscoverage['/router.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['157'][1].init(14, 26, 'typeof prefix !== \'string\'');
function visit42_157_1(result) {
  _$jscoverage['/router.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['128'][3].init(223, 17, 'replace === false');
function visit41_128_3(result) {
  _$jscoverage['/router.js'].branchData['128'][3].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['128'][2].init(201, 18, 'backward === false');
function visit40_128_2(result) {
  _$jscoverage['/router.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['128'][1].init(201, 39, 'backward === false && replace === false');
function visit39_128_1(result) {
  _$jscoverage['/router.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['127'][1].init(160, 16, 'replace === true');
function visit38_127_1(result) {
  _$jscoverage['/router.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['125'][1].init(87, 17, 'backward === true');
function visit37_125_1(result) {
  _$jscoverage['/router.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['121'][1].init(187, 21, 'uri.toString() || \'/\'');
function visit36_121_1(result) {
  _$jscoverage['/router.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['99'][1].init(80, 30, 'callbackIndex !== callbacksLen');
function visit35_99_1(result) {
  _$jscoverage['/router.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['94'][1].init(30, 17, 'cause === \'route\'');
function visit34_94_1(result) {
  _$jscoverage['/router.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['87'][1].init(40, 13, 'index !== len');
function visit33_87_1(result) {
  _$jscoverage['/router.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['64'][1].init(76, 56, 'util.startsWith(request.path + \'/\', middleware[0] + \'/\')');
function visit32_64_1(result) {
  _$jscoverage['/router.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['60'][1].init(40, 13, 'index === len');
function visit31_60_1(result) {
  _$jscoverage['/router.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['46'][1].init(84, 48, '!globalConfig.useHash && supportHistoryPushState');
function visit30_46_1(result) {
  _$jscoverage['/router.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['44'][1].init(16, 20, 'url || location.href');
function visit29_44_1(result) {
  _$jscoverage['/router.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['35'][1].init(220, 7, 'replace');
function visit28_35_1(result) {
  _$jscoverage['/router.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['19'][1].init(578, 28, 'history && history.pushState');
function visit27_19_1(result) {
  _$jscoverage['/router.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].lineData[5]++;
KISSY.add(function(S, require, exports) {
  _$jscoverage['/router.js'].functionData[0]++;
  _$jscoverage['/router.js'].lineData[6]++;
  var util = require('util');
  _$jscoverage['/router.js'].lineData[7]++;
  var middlewares = [];
  _$jscoverage['/router.js'].lineData[8]++;
  var routes = [];
  _$jscoverage['/router.js'].lineData[9]++;
  var utils = require('./router/utils');
  _$jscoverage['/router.js'].lineData[10]++;
  var Route = require('./router/route');
  _$jscoverage['/router.js'].lineData[11]++;
  var Uri = require('uri');
  _$jscoverage['/router.js'].lineData[12]++;
  var Request = require('./router/request');
  _$jscoverage['/router.js'].lineData[13]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router.js'].lineData[14]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/router.js'].lineData[15]++;
  var getVidFromUrlWithHash = utils.getVidFromUrlWithHash;
  _$jscoverage['/router.js'].lineData[16]++;
  var win = S.Env.host;
  _$jscoverage['/router.js'].lineData[17]++;
  var history = win.history;
  _$jscoverage['/router.js'].lineData[18]++;
  var supportNativeHashChange = require('feature').isHashChangeSupported();
  _$jscoverage['/router.js'].lineData[19]++;
  var supportHistoryPushState = !!(visit27_19_1(history && history.pushState));
  _$jscoverage['/router.js'].lineData[21]++;
  var BREATH_INTERVAL = 100;
  _$jscoverage['/router.js'].lineData[23]++;
  var viewUniqueId = 10;
  _$jscoverage['/router.js'].lineData[24]++;
  var viewsHistory = [viewUniqueId];
  _$jscoverage['/router.js'].lineData[25]++;
  var globalConfig = {
  urlRoot: '', 
  useHash: !supportHistoryPushState};
  _$jscoverage['/router.js'].lineData[30]++;
  function setPathByHash(path, replace) {
    _$jscoverage['/router.js'].functionData[1]++;
    _$jscoverage['/router.js'].lineData[31]++;
    var hash = utils.addVid('#!' + path + (supportNativeHashChange ? '' : (replace ? DomEvent.REPLACE_HISTORY : '')), viewUniqueId);
    _$jscoverage['/router.js'].lineData[35]++;
    if (visit28_35_1(replace)) {
      _$jscoverage['/router.js'].lineData[36]++;
      location.replace(hash);
    } else {
      _$jscoverage['/router.js'].lineData[38]++;
      location.hash = hash;
    }
  }
  _$jscoverage['/router.js'].lineData[43]++;
  function getUrlForRouter(url) {
    _$jscoverage['/router.js'].functionData[2]++;
    _$jscoverage['/router.js'].lineData[44]++;
    url = visit29_44_1(url || location.href);
    _$jscoverage['/router.js'].lineData[45]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[46]++;
    if (visit30_46_1(!globalConfig.useHash && supportHistoryPushState)) {
      _$jscoverage['/router.js'].lineData[47]++;
      var query = uri.query;
      _$jscoverage['/router.js'].lineData[48]++;
      return uri.getPath().substr(globalConfig.urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
    } else {
      _$jscoverage['/router.js'].lineData[50]++;
      return utils.getHash(url);
    }
  }
  _$jscoverage['/router.js'].lineData[54]++;
  function fireMiddleWare(request, response, cb) {
    _$jscoverage['/router.js'].functionData[3]++;
    _$jscoverage['/router.js'].lineData[55]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[56]++;
    var len = middlewares.length;
    _$jscoverage['/router.js'].lineData[58]++;
    function next() {
      _$jscoverage['/router.js'].functionData[4]++;
      _$jscoverage['/router.js'].lineData[59]++;
      index++;
      _$jscoverage['/router.js'].lineData[60]++;
      if (visit31_60_1(index === len)) {
        _$jscoverage['/router.js'].lineData[61]++;
        cb(request, response);
      } else {
        _$jscoverage['/router.js'].lineData[63]++;
        var middleware = middlewares[index];
        _$jscoverage['/router.js'].lineData[64]++;
        if (visit32_64_1(util.startsWith(request.path + '/', middleware[0] + '/'))) {
          _$jscoverage['/router.js'].lineData[65]++;
          var prefixLen = middleware[0].length;
          _$jscoverage['/router.js'].lineData[66]++;
          request.url = request.url.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[67]++;
          var path = request.path;
          _$jscoverage['/router.js'].lineData[68]++;
          request.path = request.path.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[69]++;
          middleware[1](request, next);
          _$jscoverage['/router.js'].lineData[70]++;
          request.url = request.originalUrl;
          _$jscoverage['/router.js'].lineData[71]++;
          request.path = path;
        } else {
          _$jscoverage['/router.js'].lineData[73]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[78]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[81]++;
  function fireRoutes(request, response) {
    _$jscoverage['/router.js'].functionData[5]++;
    _$jscoverage['/router.js'].lineData[82]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[83]++;
    var len = routes.length;
    _$jscoverage['/router.js'].lineData[85]++;
    function next() {
      _$jscoverage['/router.js'].functionData[6]++;
      _$jscoverage['/router.js'].lineData[86]++;
      index++;
      _$jscoverage['/router.js'].lineData[87]++;
      if (visit33_87_1(index !== len)) {
        _$jscoverage['/router.js'].lineData[88]++;
        var route = routes[index];
        _$jscoverage['/router.js'].lineData[89]++;
        if ((request.params = route.match(request.path))) {
          _$jscoverage['/router.js'].lineData[90]++;
          var callbackIndex = -1;
          _$jscoverage['/router.js'].lineData[91]++;
          var callbacks = route.callbacks;
          _$jscoverage['/router.js'].lineData[92]++;
          var callbacksLen = callbacks.length;
          _$jscoverage['/router.js'].lineData[93]++;
          var nextCallback = function(cause) {
  _$jscoverage['/router.js'].functionData[7]++;
  _$jscoverage['/router.js'].lineData[94]++;
  if (visit34_94_1(cause === 'route')) {
    _$jscoverage['/router.js'].lineData[95]++;
    nextCallback = null;
    _$jscoverage['/router.js'].lineData[96]++;
    next();
  } else {
    _$jscoverage['/router.js'].lineData[98]++;
    callbackIndex++;
    _$jscoverage['/router.js'].lineData[99]++;
    if (visit35_99_1(callbackIndex !== callbacksLen)) {
      _$jscoverage['/router.js'].lineData[100]++;
      request.route = route;
      _$jscoverage['/router.js'].lineData[101]++;
      callbacks[callbackIndex](request, response, nextCallback);
    }
  }
};
          _$jscoverage['/router.js'].lineData[105]++;
          nextCallback('');
        } else {
          _$jscoverage['/router.js'].lineData[107]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[112]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[115]++;
  function dispatch(backward, replace) {
    _$jscoverage['/router.js'].functionData[8]++;
    _$jscoverage['/router.js'].lineData[116]++;
    var url = getUrlForRouter();
    _$jscoverage['/router.js'].lineData[117]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[118]++;
    var query = uri.query.get();
    _$jscoverage['/router.js'].lineData[119]++;
    uri.query.reset();
    _$jscoverage['/router.js'].lineData[121]++;
    var path = visit36_121_1(uri.toString() || '/');
    _$jscoverage['/router.js'].lineData[122]++;
    var request = new Request({
  query: query, 
  backward: visit37_125_1(backward === true), 
  replace: visit38_127_1(replace === true), 
  forward: (visit39_128_1(visit40_128_2(backward === false) && visit41_128_3(replace === false))), 
  path: path, 
  url: url, 
  originalUrl: url});
    _$jscoverage['/router.js'].lineData[133]++;
    var response = {
  redirect: exports.navigate};
    _$jscoverage['/router.js'].lineData[136]++;
    exports.fire('dispatch', {
  request: request, 
  response: response});
    _$jscoverage['/router.js'].lineData[140]++;
    fireMiddleWare(request, response, fireRoutes);
  }
  _$jscoverage['/router.js'].lineData[149]++;
  util.mix(exports, CustomEvent.Target);
  _$jscoverage['/router.js'].lineData[156]++;
  exports.use = function(prefix, callback) {
  _$jscoverage['/router.js'].functionData[9]++;
  _$jscoverage['/router.js'].lineData[157]++;
  if (visit42_157_1(typeof prefix !== 'string')) {
    _$jscoverage['/router.js'].lineData[158]++;
    callback = prefix;
    _$jscoverage['/router.js'].lineData[159]++;
    prefix = '';
  }
  _$jscoverage['/router.js'].lineData[161]++;
  middlewares.push([prefix, callback]);
};
  _$jscoverage['/router.js'].lineData[173]++;
  exports.navigate = function(path, opts) {
  _$jscoverage['/router.js'].functionData[10]++;
  _$jscoverage['/router.js'].lineData[174]++;
  opts = visit43_174_1(opts || {});
  _$jscoverage['/router.js'].lineData[175]++;
  var replace = visit44_175_1(opts.replace || false);
  _$jscoverage['/router.js'].lineData[176]++;
  if (visit45_176_1(getUrlForRouter() !== path)) {
    _$jscoverage['/router.js'].lineData[177]++;
    if (visit46_177_1(!replace)) {
      _$jscoverage['/router.js'].lineData[178]++;
      viewUniqueId++;
      _$jscoverage['/router.js'].lineData[179]++;
      viewsHistory.push(viewUniqueId);
    }
    _$jscoverage['/router.js'].lineData[182]++;
    if (visit47_182_1(!globalConfig.useHash && supportHistoryPushState)) {
      _$jscoverage['/router.js'].lineData[183]++;
      history[replace ? 'replaceState' : 'pushState']({
  vid: viewUniqueId}, '', utils.getFullPath(path, globalConfig.urlRoot));
      _$jscoverage['/router.js'].lineData[189]++;
      dispatch(false, replace);
    } else {
      _$jscoverage['/router.js'].lineData[191]++;
      if (visit48_191_1(supportHistoryPushState)) {
        _$jscoverage['/router.js'].lineData[192]++;
        history[replace ? 'replaceState' : 'pushState']({
  vid: viewUniqueId}, '', '#!' + path);
        _$jscoverage['/router.js'].lineData[195]++;
        dispatch(false, replace);
      } else {
        _$jscoverage['/router.js'].lineData[197]++;
        setPathByHash(path, replace);
      }
    }
  } else {
    _$jscoverage['/router.js'].lineData[200]++;
    if (visit49_200_1(opts && opts.triggerRoute)) {
      _$jscoverage['/router.js'].lineData[201]++;
      dispatch(false, true);
    }
  }
};
  _$jscoverage['/router.js'].lineData[209]++;
  exports.get = function(routePath) {
  _$jscoverage['/router.js'].functionData[11]++;
  _$jscoverage['/router.js'].lineData[210]++;
  var callbacks = util.makeArray(arguments).slice(1);
  _$jscoverage['/router.js'].lineData[211]++;
  routes.push(new Route(routePath, callbacks, globalConfig));
};
  _$jscoverage['/router.js'].lineData[219]++;
  exports.matchRoute = function(path) {
  _$jscoverage['/router.js'].functionData[12]++;
  _$jscoverage['/router.js'].lineData[220]++;
  for (var i = 0, l = routes.length; visit50_220_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[221]++;
    if (visit51_221_1(routes[i].match(path))) {
      _$jscoverage['/router.js'].lineData[222]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[225]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[233]++;
  exports.removeRoute = function(routePath, callback) {
  _$jscoverage['/router.js'].functionData[13]++;
  _$jscoverage['/router.js'].lineData[234]++;
  for (var i = routes.length - 1; visit52_234_1(i >= 0); i--) {
    _$jscoverage['/router.js'].lineData[235]++;
    var r = routes[i];
    _$jscoverage['/router.js'].lineData[236]++;
    if (visit53_236_1(r.path === routePath)) {
      _$jscoverage['/router.js'].lineData[237]++;
      if (visit54_237_1(callback)) {
        _$jscoverage['/router.js'].lineData[238]++;
        r.removeCallback(callback);
        _$jscoverage['/router.js'].lineData[239]++;
        if (visit55_239_1(!r.callbacks.length)) {
          _$jscoverage['/router.js'].lineData[240]++;
          routes.splice(i, 1);
        }
      } else {
        _$jscoverage['/router.js'].lineData[243]++;
        routes.splice(i, 1);
      }
    }
  }
};
  _$jscoverage['/router.js'].lineData[250]++;
  exports.clearRoutes = function() {
  _$jscoverage['/router.js'].functionData[14]++;
  _$jscoverage['/router.js'].lineData[251]++;
  middlewares = [];
  _$jscoverage['/router.js'].lineData[252]++;
  routes = [];
};
  _$jscoverage['/router.js'].lineData[260]++;
  exports.hasRoute = function(routePath) {
  _$jscoverage['/router.js'].functionData[15]++;
  _$jscoverage['/router.js'].lineData[261]++;
  for (var i = 0, l = routes.length; visit56_261_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[262]++;
    if (visit57_262_1(routes[i].path === routePath)) {
      _$jscoverage['/router.js'].lineData[263]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[266]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[269]++;
  function dispatchByVid(vid) {
    _$jscoverage['/router.js'].functionData[16]++;
    _$jscoverage['/router.js'].lineData[270]++;
    var backward = false;
    _$jscoverage['/router.js'].lineData[271]++;
    var replace = false;
    _$jscoverage['/router.js'].lineData[273]++;
    if (visit58_273_1(vid === viewsHistory[viewsHistory.length - 2])) {
      _$jscoverage['/router.js'].lineData[274]++;
      backward = true;
      _$jscoverage['/router.js'].lineData[275]++;
      viewsHistory.pop();
    } else {
      _$jscoverage['/router.js'].lineData[276]++;
      if (visit59_278_1(vid !== viewsHistory[viewsHistory.length - 1])) {
        _$jscoverage['/router.js'].lineData[279]++;
        viewsHistory.push(vid);
      } else {
        _$jscoverage['/router.js'].lineData[281]++;
        replace = true;
      }
    }
    _$jscoverage['/router.js'].lineData[284]++;
    dispatch(backward, replace);
  }
  _$jscoverage['/router.js'].lineData[287]++;
  function onPopState(e) {
    _$jscoverage['/router.js'].functionData[17]++;
    _$jscoverage['/router.js'].lineData[289]++;
    var state = e.originalEvent.state;
    _$jscoverage['/router.js'].lineData[291]++;
    if (visit60_291_1(!state)) {
      _$jscoverage['/router.js'].lineData[292]++;
      return;
    }
    _$jscoverage['/router.js'].lineData[294]++;
    dispatchByVid(state.vid);
  }
  _$jscoverage['/router.js'].lineData[297]++;
  function onHashChange(e) {
    _$jscoverage['/router.js'].functionData[18]++;
    _$jscoverage['/router.js'].lineData[300]++;
    var newURL = visit61_300_1(e.newURL || location.href);
    _$jscoverage['/router.js'].lineData[301]++;
    var vid = getVidFromUrlWithHash(newURL);
    _$jscoverage['/router.js'].lineData[302]++;
    if (visit62_302_1(!vid)) {
      _$jscoverage['/router.js'].lineData[303]++;
      return;
    }
    _$jscoverage['/router.js'].lineData[305]++;
    dispatchByVid(vid);
  }
  _$jscoverage['/router.js'].lineData[319]++;
  exports.config = function(opts) {
  _$jscoverage['/router.js'].functionData[19]++;
  _$jscoverage['/router.js'].lineData[320]++;
  if (visit63_320_1(opts.urlRoot)) {
    _$jscoverage['/router.js'].lineData[321]++;
    opts.urlRoot = opts.urlRoot.replace(/\/$/, '');
  }
  _$jscoverage['/router.js'].lineData[323]++;
  util.mix(globalConfig, opts);
};
  _$jscoverage['/router.js'].lineData[326]++;
  var started;
  _$jscoverage['/router.js'].lineData[334]++;
  exports.start = function(callback) {
  _$jscoverage['/router.js'].functionData[20]++;
  _$jscoverage['/router.js'].lineData[335]++;
  if (visit64_335_1(started)) {
    _$jscoverage['/router.js'].lineData[336]++;
    return visit65_336_1(callback && callback.call(exports));
  }
  _$jscoverage['/router.js'].lineData[339]++;
  var useHash = globalConfig.useHash, urlRoot = globalConfig.urlRoot, triggerRoute = globalConfig.triggerRoute, locPath = location.pathname, href = location.href, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/router.js'].lineData[347]++;
  if (visit66_347_1(!useHash)) {
    _$jscoverage['/router.js'].lineData[348]++;
    if (visit67_348_1(supportHistoryPushState)) {
      _$jscoverage['/router.js'].lineData[354]++;
      if (visit68_354_1(hashIsValid)) {
        _$jscoverage['/router.js'].lineData[355]++;
        if (visit69_355_1(utils.equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/router.js'].lineData[357]++;
          history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
          _$jscoverage['/router.js'].lineData[358]++;
          triggerRoute = 1;
        } else {
          _$jscoverage['/router.js'].lineData[360]++;
          S.error('router: location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/router.js'].lineData[363]++;
      if (visit70_363_1(!utils.equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/router.js'].lineData[369]++;
        location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/router.js'].lineData[370]++;
        return undefined;
      } else {
        _$jscoverage['/router.js'].lineData[372]++;
        useHash = true;
      }
    }
  }
  _$jscoverage['/router.js'].lineData[377]++;
  setTimeout(function() {
  _$jscoverage['/router.js'].functionData[21]++;
  _$jscoverage['/router.js'].lineData[378]++;
  var needReplaceHistory = supportHistoryPushState;
  _$jscoverage['/router.js'].lineData[379]++;
  if (visit71_379_1(supportHistoryPushState)) {
    _$jscoverage['/router.js'].lineData[380]++;
    DomEvent.on(win, 'popstate', onPopState);
  } else {
    _$jscoverage['/router.js'].lineData[384]++;
    DomEvent.on(win, 'hashchange', onHashChange);
    _$jscoverage['/router.js'].lineData[386]++;
    triggerRoute = 1;
  }
  _$jscoverage['/router.js'].lineData[388]++;
  if (visit72_388_1(useHash)) {
    _$jscoverage['/router.js'].lineData[389]++;
    if (visit73_389_1(!getUrlForRouter())) {
      _$jscoverage['/router.js'].lineData[390]++;
      exports.navigate('/', {
  replace: 1});
      _$jscoverage['/router.js'].lineData[393]++;
      triggerRoute = 0;
      _$jscoverage['/router.js'].lineData[394]++;
      needReplaceHistory = false;
    } else {
      _$jscoverage['/router.js'].lineData[395]++;
      if (visit74_395_1(!supportHistoryPushState && visit75_395_2(getVidFromUrlWithHash(href) !== viewUniqueId))) {
        _$jscoverage['/router.js'].lineData[396]++;
        setPathByHash(utils.getHash(href), true);
        _$jscoverage['/router.js'].lineData[397]++;
        triggerRoute = 0;
      } else {
        _$jscoverage['/router.js'].lineData[398]++;
        if (visit76_398_1(supportHistoryPushState && utils.hasVid(href))) {
          _$jscoverage['/router.js'].lineData[399]++;
          location.replace(href = utils.removeVid(href));
        }
      }
    }
  }
  _$jscoverage['/router.js'].lineData[402]++;
  if (visit77_402_1(needReplaceHistory)) {
    _$jscoverage['/router.js'].lineData[404]++;
    history.replaceState({
  vid: viewUniqueId}, '', href);
  }
  _$jscoverage['/router.js'].lineData[411]++;
  if (visit78_411_1(triggerRoute)) {
    _$jscoverage['/router.js'].lineData[412]++;
    dispatch(false, true);
  }
  _$jscoverage['/router.js'].lineData[415]++;
  if (visit79_415_1(callback)) {
    _$jscoverage['/router.js'].lineData[416]++;
    callback(exports);
  }
}, BREATH_INTERVAL);
  _$jscoverage['/router.js'].lineData[420]++;
  started = true;
  _$jscoverage['/router.js'].lineData[421]++;
  return exports;
};
  _$jscoverage['/router.js'].lineData[424]++;
  exports.Utils = utils;
  _$jscoverage['/router.js'].lineData[427]++;
  exports.stop = function() {
  _$jscoverage['/router.js'].functionData[22]++;
  _$jscoverage['/router.js'].lineData[428]++;
  started = false;
  _$jscoverage['/router.js'].lineData[429]++;
  DomEvent.detach(win, 'hashchange', onHashChange);
  _$jscoverage['/router.js'].lineData[430]++;
  DomEvent.detach(win, 'popstate', onPopState);
};
});
