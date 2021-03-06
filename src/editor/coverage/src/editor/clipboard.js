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
if (! _$jscoverage['/editor/clipboard.js']) {
  _$jscoverage['/editor/clipboard.js'] = {};
  _$jscoverage['/editor/clipboard.js'].lineData = [];
  _$jscoverage['/editor/clipboard.js'].lineData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[22] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[27] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[37] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[38] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[39] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[40] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[41] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[42] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[43] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[47] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[48] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[53] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[55] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[65] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[67] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[68] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[69] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[70] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[71] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[72] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[73] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[78] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[79] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[80] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[84] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[86] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[87] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[90] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[93] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[98] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[99] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[100] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[102] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[106] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[107] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[108] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[111] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[114] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[116] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[119] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[123] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[124] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[125] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[127] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[128] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[129] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[137] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[139] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[145] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[148] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[149] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[153] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[154] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[157] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[159] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[164] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[165] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[166] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[169] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[173] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[178] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[180] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[181] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[184] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[186] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[198] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[200] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[203] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[204] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[205] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[207] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[212] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[213] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[215] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[219] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[221] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[223] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[225] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[229] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[232] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[234] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[239] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[240] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[243] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[244] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[247] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[249] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[250] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[253] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[261] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[262] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[266] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[273] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[276] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[278] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[280] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[284] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[286] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[290] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[292] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[295] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[299] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[306] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[307] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[308] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[309] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[310] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[312] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[313] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[314] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[315] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[316] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[317] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[320] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[322] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[323] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[324] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[330] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[331] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[333] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[334] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[336] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[338] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[339] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[341] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[343] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[344] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[347] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[350] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[354] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[355] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[360] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[361] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[365] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[367] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[368] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[369] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[371] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[377] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[378] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[382] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[385] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[386] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[388] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[389] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[390] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[394] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[397] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[398] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[399] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[400] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[402] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[403] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[405] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[407] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[408] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[409] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[411] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[414] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[415] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[418] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[421] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[427] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[429] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[431] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[432] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[436] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[437] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[440] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[441] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[442] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[443] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[444] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[445] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[446] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[447] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[448] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[457] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[462] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[465] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[466] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[468] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[469] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[470] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[471] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[472] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[478] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[479] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[480] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[481] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[484] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[485] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[486] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[487] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[488] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[495] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[498] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[499] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[500] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[501] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[502] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[504] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[506] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[507] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[508] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[509] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[510] = 0;
  _$jscoverage['/editor/clipboard.js'].lineData[512] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].functionData) {
  _$jscoverage['/editor/clipboard.js'].functionData = [];
  _$jscoverage['/editor/clipboard.js'].functionData[0] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[1] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[2] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[3] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[4] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[5] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[6] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[7] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[8] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[9] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[10] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[11] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[12] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[13] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[14] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[15] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[16] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[17] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[18] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[19] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[20] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[21] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[22] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[23] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[24] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[25] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[26] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[27] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[28] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[29] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[30] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[31] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[32] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[33] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[34] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[35] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[36] = 0;
  _$jscoverage['/editor/clipboard.js'].functionData[37] = 0;
}
if (! _$jscoverage['/editor/clipboard.js'].branchData) {
  _$jscoverage['/editor/clipboard.js'].branchData = {};
  _$jscoverage['/editor/clipboard.js'].branchData['15'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['40'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['41'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['43'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['53'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['67'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['86'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['90'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['92'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['102'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['115'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['116'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['116'][3] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['124'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['139'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['153'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['164'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['180'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['215'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['225'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['239'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['243'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['247'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['276'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['310'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['322'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['331'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['333'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['336'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['338'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['341'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['343'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['360'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['365'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['367'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['377'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['382'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['385'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['388'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['400'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['407'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['414'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['436'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['468'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['471'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['480'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['498'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['501'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['507'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/editor/clipboard.js'].branchData['509'] = [];
  _$jscoverage['/editor/clipboard.js'].branchData['509'][1] = new BranchData();
}
_$jscoverage['/editor/clipboard.js'].branchData['509'][1].init(104, 5, 'c.set');
function visit57_509_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['507'][1].init(310, 24, 'clipboardCommands[value]');
function visit56_507_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['501'][1].init(104, 5, 'c.get');
function visit55_501_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['498'][1].init(1463, 6, 'i >= 0');
function visit54_498_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['480'][1].init(90, 24, 'clipboardCommands[value]');
function visit53_480_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['471'][1].init(105, 32, 'i < clipboardCommandsList.length');
function visit52_471_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['468'][1].init(97, 22, '!contextmenu.__copyFix');
function visit51_468_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['436'][1].init(202, 1, '0');
function visit50_436_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['414'][1].init(873, 30, '!htmlMode && isPlainText(html)');
function visit49_414_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['407'][1].init(422, 59, 'html.indexOf(\'<br class="Apple-interchange-newline">\') > -1');
function visit48_407_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['400'][1].init(126, 29, 'html.indexOf(\'Apple-\') !== -1');
function visit47_400_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['388'][1].init(206, 29, 'html.indexOf(\'<br><br>\') > -1');
function visit46_388_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['385'][1].init(102, 8, 'UA.gecko');
function visit45_385_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['382'][1].init(1036, 8, 'UA.gecko');
function visit44_382_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['377'][1].init(509, 26, 'html.match(/<\\/div><div>/)');
function visit43_377_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['367'][1].init(82, 35, 'html.match(/<div>(?:<br>)?<\\/div>/)');
function visit42_367_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['365'][2].init(269, 26, 'html.indexOf(\'<div>\') > -1');
function visit41_365_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['365'][1].init(256, 39, 'UA.webkit && html.indexOf(\'<div>\') > -1');
function visit40_365_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['360'][1].init(160, 20, 'html.match(/^[^<]$/)');
function visit39_360_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['343'][1].init(48, 38, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi)');
function visit38_343_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['341'][1].init(566, 8, 'UA.gecko');
function visit37_341_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['338'][1].init(119, 98, '!html.match(/^([^<]|<br( ?\\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\\/)?>)*<\\/p>|(\\r\\n))*$/gi)');
function visit36_338_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['336'][1].init(274, 5, 'UA.ie');
function visit35_336_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['333'][1].init(91, 90, '!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\\/)?><\\/div>|<div>[^<]*<\\/div>)*$/gi)');
function visit34_333_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['331'][1].init(14, 9, 'UA.webkit');
function visit33_331_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['322'][1].init(64, 16, 'control.parent()');
function visit32_322_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['310'][2].init(131, 39, 'sel.getType() === KES.SELECTION_ELEMENT');
function visit31_310_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['310'][1].init(131, 93, '(sel.getType() === KES.SELECTION_ELEMENT) && (control = sel.getSelectedElement())');
function visit30_310_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['276'][1].init(586, 13, 'UA.ieMode > 7');
function visit29_276_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['247'][1].init(1340, 61, '/(class="?Mso|style="[^"]*\\bmso\\-|w:WordDocument)/.test(html)');
function visit28_247_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['243'][1].init(1203, 16, 're !== undefined');
function visit27_243_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['239'][1].init(1116, 12, 're === false');
function visit26_239_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['225'][1].init(686, 26, '!(html = cleanPaste(html))');
function visit25_225_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['215'][2].init(14, 94, '(bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit24_215_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['215'][1].init(-1, 108, 'UA.webkit && (bogusSpan = pasteBin.first()) && (bogusSpan.hasClass(\'Apple-style-span\'))');
function visit23_215_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['180'][1].init(1015, 9, 'UA.webkit');
function visit22_180_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['164'][1].init(388, 34, 'doc.getElementById(\'ke-paste-bin\')');
function visit21_164_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['153'][1].init(18, 26, 'this._isPreventBeforePaste');
function visit20_153_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['139'][1].init(87, 20, 'self._isPreventPaste');
function visit19_139_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['124'][1].init(48, 23, 'self._preventPasteTimer');
function visit18_124_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['116'][3].init(208, 19, 'ranges.length === 1');
function visit17_116_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['116'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['116'][2].init(208, 44, 'ranges.length === 1 && ranges[0].collapsed');
function visit16_116_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['116'][1].init(196, 57, 'ranges && !(ranges.length === 1 && ranges[0].collapsed)');
function visit15_116_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['115'][1].init(62, 22, 'sel && sel.getRanges()');
function visit14_115_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['102'][1].init(111, 19, 'command === \'paste\'');
function visit13_102_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['92'][2].init(317, 16, 'e.keyCode === 45');
function visit12_92_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['92'][1].init(82, 30, 'e.shiftKey && e.keyCode === 45');
function visit11_92_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['90'][3].init(231, 16, 'e.keyCode === 86');
function visit10_90_3(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['90'][2].init(218, 29, 'e.ctrlKey && e.keyCode === 86');
function visit9_90_2(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['90'][1].init(218, 113, 'e.ctrlKey && e.keyCode === 86 || e.shiftKey && e.keyCode === 45');
function visit8_90_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['86'][1].init(87, 47, 'editor.get(\'mode\') !== Editor.Mode.WYSIWYG_MODE');
function visit7_86_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['67'][1].init(1841, 6, 'OLD_IE');
function visit6_67_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['53'][1].init(725, 32, '!tryToCutCopyPaste(editor, type)');
function visit5_53_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['43'][1].init(142, 16, 'type === \'paste\'');
function visit4_43_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['41'][1].init(34, 14, 'type === \'cut\'');
function visit3_41_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['40'][1].init(30, 6, 'OLD_IE');
function visit2_40_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].branchData['15'][1].init(64, 14, 'UA.ieMode < 11');
function visit1_15_1(result) {
  _$jscoverage['/editor/clipboard.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/clipboard.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/clipboard.js'].functionData[0]++;
  _$jscoverage['/editor/clipboard.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/editor/clipboard.js'].lineData[8]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor/clipboard.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/editor/clipboard.js'].lineData[10]++;
  var Editor = require('./base');
  _$jscoverage['/editor/clipboard.js'].lineData[11]++;
  var KERange = require('./range');
  _$jscoverage['/editor/clipboard.js'].lineData[12]++;
  var KES = require('./selection');
  _$jscoverage['/editor/clipboard.js'].lineData[13]++;
  var $ = Node.all, UA = require('ua'), OLD_IE = visit1_15_1(UA.ieMode < 11), pasteEvent = OLD_IE ? 'beforepaste' : 'paste', KER = Editor.RangeType;
  _$jscoverage['/editor/clipboard.js'].lineData[19]++;
  function Paste(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[1]++;
    _$jscoverage['/editor/clipboard.js'].lineData[20]++;
    var self = this;
    _$jscoverage['/editor/clipboard.js'].lineData[21]++;
    self.editor = editor;
    _$jscoverage['/editor/clipboard.js'].lineData[22]++;
    self._init();
  }
  _$jscoverage['/editor/clipboard.js'].lineData[25]++;
  util.augment(Paste, {
  _init: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[2]++;
  _$jscoverage['/editor/clipboard.js'].lineData[27]++;
  var self = this, editor = self.editor, editorDoc = editor.get('document'), editorBody = editorDoc.one('body'), CutCopyPasteCmd = function(type) {
  _$jscoverage['/editor/clipboard.js'].functionData[3]++;
  _$jscoverage['/editor/clipboard.js'].lineData[32]++;
  this.type = type;
};
  _$jscoverage['/editor/clipboard.js'].lineData[35]++;
  CutCopyPasteCmd.prototype = {
  exec: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[4]++;
  _$jscoverage['/editor/clipboard.js'].lineData[37]++;
  var type = this.type;
  _$jscoverage['/editor/clipboard.js'].lineData[38]++;
  editor.focus();
  _$jscoverage['/editor/clipboard.js'].lineData[39]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[5]++;
  _$jscoverage['/editor/clipboard.js'].lineData[40]++;
  if (visit2_40_1(OLD_IE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[41]++;
    if (visit3_41_1(type === 'cut')) {
      _$jscoverage['/editor/clipboard.js'].lineData[42]++;
      fixCut(editor);
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[43]++;
      if (visit4_43_1(type === 'paste')) {
        _$jscoverage['/editor/clipboard.js'].lineData[47]++;
        self._preventPasteEvent();
        _$jscoverage['/editor/clipboard.js'].lineData[48]++;
        self._getClipboardDataFromPasteBin();
      }
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[53]++;
  if (visit5_53_1(!tryToCutCopyPaste(editor, type))) {
    _$jscoverage['/editor/clipboard.js'].lineData[55]++;
    alert(errorTypes[type]);
  }
}, 0);
}};
  _$jscoverage['/editor/clipboard.js'].lineData[65]++;
  editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);
  _$jscoverage['/editor/clipboard.js'].lineData[67]++;
  if (visit6_67_1(OLD_IE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[68]++;
    editorBody.on('paste', self._iePaste, self);
    _$jscoverage['/editor/clipboard.js'].lineData[69]++;
    editorDoc.on('keydown', self._onKeyDown, self);
    _$jscoverage['/editor/clipboard.js'].lineData[70]++;
    editorDoc.on('contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[6]++;
  _$jscoverage['/editor/clipboard.js'].lineData[71]++;
  self._isPreventBeforePaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[72]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[7]++;
  _$jscoverage['/editor/clipboard.js'].lineData[73]++;
  self._isPreventBeforePaste = 0;
}, 0);
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[78]++;
  editor.addCommand('copy', new CutCopyPasteCmd('copy'));
  _$jscoverage['/editor/clipboard.js'].lineData[79]++;
  editor.addCommand('cut', new CutCopyPasteCmd('cut'));
  _$jscoverage['/editor/clipboard.js'].lineData[80]++;
  editor.addCommand('paste', new CutCopyPasteCmd('paste'));
}, 
  _onKeyDown: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[8]++;
  _$jscoverage['/editor/clipboard.js'].lineData[84]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[86]++;
  if (visit7_86_1(editor.get('mode') !== Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/editor/clipboard.js'].lineData[87]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[90]++;
  if (visit8_90_1(visit9_90_2(e.ctrlKey && visit10_90_3(e.keyCode === 86)) || visit11_92_1(e.shiftKey && visit12_92_2(e.keyCode === 45)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[93]++;
    self._preventPasteEvent();
  }
}, 
  _stateFromNamedCommand: function(command) {
  _$jscoverage['/editor/clipboard.js'].functionData[9]++;
  _$jscoverage['/editor/clipboard.js'].lineData[98]++;
  var ret;
  _$jscoverage['/editor/clipboard.js'].lineData[99]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[100]++;
  var editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[102]++;
  if (visit13_102_1(command === 'paste')) {
    _$jscoverage['/editor/clipboard.js'].lineData[106]++;
    self._isPreventBeforePaste = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[107]++;
    try {
      _$jscoverage['/editor/clipboard.js'].lineData[108]++;
      ret = editor.get('document')[0].queryCommandEnabled(command);
    }    catch (e) {
}
    _$jscoverage['/editor/clipboard.js'].lineData[111]++;
    self._isPreventBeforePaste = 0;
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[114]++;
    var sel = editor.getSelection(), ranges = visit14_115_1(sel && sel.getRanges());
    _$jscoverage['/editor/clipboard.js'].lineData[116]++;
    ret = visit15_116_1(ranges && !(visit16_116_2(visit17_116_3(ranges.length === 1) && ranges[0].collapsed)));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[119]++;
  return ret;
}, 
  _preventPasteEvent: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[10]++;
  _$jscoverage['/editor/clipboard.js'].lineData[123]++;
  var self = this;
  _$jscoverage['/editor/clipboard.js'].lineData[124]++;
  if (visit18_124_1(self._preventPasteTimer)) {
    _$jscoverage['/editor/clipboard.js'].lineData[125]++;
    clearTimeout(self._preventPasteTimer);
  }
  _$jscoverage['/editor/clipboard.js'].lineData[127]++;
  self._isPreventPaste = 1;
  _$jscoverage['/editor/clipboard.js'].lineData[128]++;
  self._preventPasteTimer = setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[11]++;
  _$jscoverage['/editor/clipboard.js'].lineData[129]++;
  self._isPreventPaste = 0;
}, 70);
}, 
  _iePaste: function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[12]++;
  _$jscoverage['/editor/clipboard.js'].lineData[137]++;
  var self = this, editor = self.editor;
  _$jscoverage['/editor/clipboard.js'].lineData[139]++;
  if (visit19_139_1(self._isPreventPaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[145]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[148]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[149]++;
  editor.execCommand('paste');
}, 
  _getClipboardDataFromPasteBin: function() {
  _$jscoverage['/editor/clipboard.js'].functionData[13]++;
  _$jscoverage['/editor/clipboard.js'].lineData[153]++;
  if (visit20_153_1(this._isPreventBeforePaste)) {
    _$jscoverage['/editor/clipboard.js'].lineData[154]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[157]++;
  logger.debug(pasteEvent + ': ' + ' paste event happen');
  _$jscoverage['/editor/clipboard.js'].lineData[159]++;
  var self = this, editor = self.editor, doc = editor.get('document')[0];
  _$jscoverage['/editor/clipboard.js'].lineData[164]++;
  if (visit21_164_1(doc.getElementById('ke-paste-bin'))) {
    _$jscoverage['/editor/clipboard.js'].lineData[165]++;
    logger.debug(pasteEvent + ': trigger more than once ...');
    _$jscoverage['/editor/clipboard.js'].lineData[166]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[169]++;
  var sel = editor.getSelection(), range = new KERange(doc);
  _$jscoverage['/editor/clipboard.js'].lineData[173]++;
  var pasteBin = $(UA.webkit ? '<body></body>' : '<div></div>', doc);
  _$jscoverage['/editor/clipboard.js'].lineData[178]++;
  pasteBin.attr('id', 'ke-paste-bin');
  _$jscoverage['/editor/clipboard.js'].lineData[180]++;
  if (visit22_180_1(UA.webkit)) {
    _$jscoverage['/editor/clipboard.js'].lineData[181]++;
    pasteBin[0].appendChild(doc.createTextNode('\u200b'));
  }
  _$jscoverage['/editor/clipboard.js'].lineData[184]++;
  doc.body.appendChild(pasteBin[0]);
  _$jscoverage['/editor/clipboard.js'].lineData[186]++;
  pasteBin.css({
  position: 'absolute', 
  top: sel.getStartElement().offset().top + 'px', 
  width: '1px', 
  height: '1px', 
  overflow: 'hidden'});
  _$jscoverage['/editor/clipboard.js'].lineData[198]++;
  pasteBin.css('left', '-1000px');
  _$jscoverage['/editor/clipboard.js'].lineData[200]++;
  var bms = sel.createBookmarks();
  _$jscoverage['/editor/clipboard.js'].lineData[203]++;
  range.setStartAt(pasteBin, KER.POSITION_AFTER_START);
  _$jscoverage['/editor/clipboard.js'].lineData[204]++;
  range.setEndAt(pasteBin, KER.POSITION_BEFORE_END);
  _$jscoverage['/editor/clipboard.js'].lineData[205]++;
  range.select(true);
  _$jscoverage['/editor/clipboard.js'].lineData[207]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[14]++;
  _$jscoverage['/editor/clipboard.js'].lineData[212]++;
  var bogusSpan;
  _$jscoverage['/editor/clipboard.js'].lineData[213]++;
  var oldPasteBin = pasteBin;
  _$jscoverage['/editor/clipboard.js'].lineData[215]++;
  pasteBin = (visit23_215_1(UA.webkit && visit24_215_2((bogusSpan = pasteBin.first()) && (bogusSpan.hasClass('Apple-style-span')))) ? bogusSpan : pasteBin);
  _$jscoverage['/editor/clipboard.js'].lineData[219]++;
  sel.selectBookmarks(bms);
  _$jscoverage['/editor/clipboard.js'].lineData[221]++;
  var html = pasteBin.html();
  _$jscoverage['/editor/clipboard.js'].lineData[223]++;
  oldPasteBin.remove();
  _$jscoverage['/editor/clipboard.js'].lineData[225]++;
  if (visit25_225_1(!(html = cleanPaste(html)))) {
    _$jscoverage['/editor/clipboard.js'].lineData[229]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[232]++;
  logger.debug('paste ' + html);
  _$jscoverage['/editor/clipboard.js'].lineData[234]++;
  var re = editor.fire('paste', {
  html: html});
  _$jscoverage['/editor/clipboard.js'].lineData[239]++;
  if (visit26_239_1(re === false)) {
    _$jscoverage['/editor/clipboard.js'].lineData[240]++;
    return;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[243]++;
  if (visit27_243_1(re !== undefined)) {
    _$jscoverage['/editor/clipboard.js'].lineData[244]++;
    html = re;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[247]++;
  if (visit28_247_1(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html))) {
    _$jscoverage['/editor/clipboard.js'].lineData[249]++;
    S.use('editor/plugin/word-filter', function(S, wordFilter) {
  _$jscoverage['/editor/clipboard.js'].functionData[15]++;
  _$jscoverage['/editor/clipboard.js'].lineData[250]++;
  editor.insertHtml(wordFilter.toDataFormat(html, editor));
});
  } else {
    _$jscoverage['/editor/clipboard.js'].lineData[253]++;
    editor.insertHtml(html);
  }
}, 0);
}});
  _$jscoverage['/editor/clipboard.js'].lineData[261]++;
  var execIECommand = function(editor, command) {
  _$jscoverage['/editor/clipboard.js'].functionData[16]++;
  _$jscoverage['/editor/clipboard.js'].lineData[262]++;
  var doc = editor.get('document')[0], body = $(doc.body), enabled = false, onExec = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[17]++;
  _$jscoverage['/editor/clipboard.js'].lineData[266]++;
  enabled = true;
};
  _$jscoverage['/editor/clipboard.js'].lineData[273]++;
  body.on(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[276]++;
  (visit29_276_1(UA.ieMode > 7) ? doc : doc.selection.createRange()).execCommand(command);
  _$jscoverage['/editor/clipboard.js'].lineData[278]++;
  body.detach(command, onExec);
  _$jscoverage['/editor/clipboard.js'].lineData[280]++;
  return enabled;
};
  _$jscoverage['/editor/clipboard.js'].lineData[284]++;
  var tryToCutCopyPaste = OLD_IE ? function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[18]++;
  _$jscoverage['/editor/clipboard.js'].lineData[286]++;
  return execIECommand(editor, type);
} : function(editor, type) {
  _$jscoverage['/editor/clipboard.js'].functionData[19]++;
  _$jscoverage['/editor/clipboard.js'].lineData[290]++;
  try {
    _$jscoverage['/editor/clipboard.js'].lineData[292]++;
    return editor.get('document')[0].execCommand(type);
  }  catch (e) {
  _$jscoverage['/editor/clipboard.js'].lineData[295]++;
  return false;
}
};
  _$jscoverage['/editor/clipboard.js'].lineData[299]++;
  var errorTypes = {
  cut: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u526a\u5207\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+X)\u6765\u5b8c\u6210', 
  copy: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u590d\u5236\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+C)\u6765\u5b8c\u6210', 
  paste: '\u60a8\u7684\u6d4f\u89c8\u5668\u5b89\u5168\u8bbe\u7f6e\u4e0d\u5141\u8bb8\u7f16\u8f91\u5668\u81ea\u52a8\u6267\u884c\u7c98\u8d34\u64cd\u4f5c\uff0c\u8bf7\u4f7f\u7528\u952e\u76d8\u5feb\u6377\u952e(Ctrl/Cmd+V)\u6765\u5b8c\u6210'};
  _$jscoverage['/editor/clipboard.js'].lineData[306]++;
  function fixCut(editor) {
    _$jscoverage['/editor/clipboard.js'].functionData[20]++;
    _$jscoverage['/editor/clipboard.js'].lineData[307]++;
    var editorDoc = editor.get('document')[0];
    _$jscoverage['/editor/clipboard.js'].lineData[308]++;
    var sel = editor.getSelection();
    _$jscoverage['/editor/clipboard.js'].lineData[309]++;
    var control;
    _$jscoverage['/editor/clipboard.js'].lineData[310]++;
    if (visit30_310_1((visit31_310_2(sel.getType() === KES.SELECTION_ELEMENT)) && (control = sel.getSelectedElement()))) {
      _$jscoverage['/editor/clipboard.js'].lineData[312]++;
      var range = sel.getRanges()[0];
      _$jscoverage['/editor/clipboard.js'].lineData[313]++;
      var dummy = $(editorDoc.createTextNode(''));
      _$jscoverage['/editor/clipboard.js'].lineData[314]++;
      dummy.insertBefore(control);
      _$jscoverage['/editor/clipboard.js'].lineData[315]++;
      range.setStartBefore(dummy);
      _$jscoverage['/editor/clipboard.js'].lineData[316]++;
      range.setEndAfter(control);
      _$jscoverage['/editor/clipboard.js'].lineData[317]++;
      sel.selectRanges([range]);
      _$jscoverage['/editor/clipboard.js'].lineData[320]++;
      setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[21]++;
  _$jscoverage['/editor/clipboard.js'].lineData[322]++;
  if (visit32_322_1(control.parent())) {
    _$jscoverage['/editor/clipboard.js'].lineData[323]++;
    dummy.remove();
    _$jscoverage['/editor/clipboard.js'].lineData[324]++;
    sel.selectElement(control);
  }
}, 0);
    }
  }
  _$jscoverage['/editor/clipboard.js'].lineData[330]++;
  function isPlainText(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[22]++;
    _$jscoverage['/editor/clipboard.js'].lineData[331]++;
    if (visit33_331_1(UA.webkit)) {
      _$jscoverage['/editor/clipboard.js'].lineData[333]++;
      if (visit34_333_1(!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi))) {
        _$jscoverage['/editor/clipboard.js'].lineData[334]++;
        return 0;
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[336]++;
      if (visit35_336_1(UA.ie)) {
        _$jscoverage['/editor/clipboard.js'].lineData[338]++;
        if (visit36_338_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi))) {
          _$jscoverage['/editor/clipboard.js'].lineData[339]++;
          return 0;
        }
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[341]++;
        if (visit37_341_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[343]++;
          if (visit38_343_1(!html.match(/^([^<]|<br( ?\/)?>)*$/gi))) {
            _$jscoverage['/editor/clipboard.js'].lineData[344]++;
            return 0;
          }
        } else {
          _$jscoverage['/editor/clipboard.js'].lineData[347]++;
          return 0;
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[350]++;
    return 1;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[354]++;
  function plainTextToHtml(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[23]++;
    _$jscoverage['/editor/clipboard.js'].lineData[355]++;
    html = html.replace(/\s+/g, ' ').replace(/> +</g, '><').replace(/<br ?\/>/gi, '<br>');
    _$jscoverage['/editor/clipboard.js'].lineData[360]++;
    if (visit39_360_1(html.match(/^[^<]$/))) {
      _$jscoverage['/editor/clipboard.js'].lineData[361]++;
      return html;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[365]++;
    if (visit40_365_1(UA.webkit && visit41_365_2(html.indexOf('<div>') > -1))) {
      _$jscoverage['/editor/clipboard.js'].lineData[367]++;
      if (visit42_367_1(html.match(/<div>(?:<br>)?<\/div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[368]++;
        html = html.replace(/<div>(?:<br>)?<\/div>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[24]++;
  _$jscoverage['/editor/clipboard.js'].lineData[369]++;
  return '<p></p>';
});
        _$jscoverage['/editor/clipboard.js'].lineData[371]++;
        html = html.replace(/<\/p><div>/g, '</p><p>').replace(/<\/div><p>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[377]++;
      if (visit43_377_1(html.match(/<\/div><div>/))) {
        _$jscoverage['/editor/clipboard.js'].lineData[378]++;
        html = html.replace(/<\/div><div>/g, '</p><p>').replace(/^<div>/, '<p>').replace(/^<\/div>/, '</p>');
      }
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[382]++;
      if (visit44_382_1(UA.gecko)) {
        _$jscoverage['/editor/clipboard.js'].lineData[385]++;
        if (visit45_385_1(UA.gecko)) {
          _$jscoverage['/editor/clipboard.js'].lineData[386]++;
          html = html.replace(/^<br><br>$/, '<br>');
        }
        _$jscoverage['/editor/clipboard.js'].lineData[388]++;
        if (visit46_388_1(html.indexOf('<br><br>') > -1)) {
          _$jscoverage['/editor/clipboard.js'].lineData[389]++;
          html = '<p>' + html.replace(/<br><br>/g, function() {
  _$jscoverage['/editor/clipboard.js'].functionData[25]++;
  _$jscoverage['/editor/clipboard.js'].lineData[390]++;
  return '</p><p>';
}) + '</p>';
        }
      }
    }
    _$jscoverage['/editor/clipboard.js'].lineData[394]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[397]++;
  function cleanPaste(html) {
    _$jscoverage['/editor/clipboard.js'].functionData[26]++;
    _$jscoverage['/editor/clipboard.js'].lineData[398]++;
    var htmlMode = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[399]++;
    html = html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '');
    _$jscoverage['/editor/clipboard.js'].lineData[400]++;
    if (visit47_400_1(html.indexOf('Apple-') !== -1)) {
      _$jscoverage['/editor/clipboard.js'].lineData[402]++;
      html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
      _$jscoverage['/editor/clipboard.js'].lineData[403]++;
      html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function(all, spaces) {
  _$jscoverage['/editor/clipboard.js'].functionData[27]++;
  _$jscoverage['/editor/clipboard.js'].lineData[405]++;
  return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
});
      _$jscoverage['/editor/clipboard.js'].lineData[407]++;
      if (visit48_407_1(html.indexOf('<br class="Apple-interchange-newline">') > -1)) {
        _$jscoverage['/editor/clipboard.js'].lineData[408]++;
        htmlMode = 1;
        _$jscoverage['/editor/clipboard.js'].lineData[409]++;
        html = html.replace(/<br class="Apple-interchange-newline">/, '');
      }
      _$jscoverage['/editor/clipboard.js'].lineData[411]++;
      html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
    }
    _$jscoverage['/editor/clipboard.js'].lineData[414]++;
    if (visit49_414_1(!htmlMode && isPlainText(html))) {
      _$jscoverage['/editor/clipboard.js'].lineData[415]++;
      html = plainTextToHtml(html);
    }
    _$jscoverage['/editor/clipboard.js'].lineData[418]++;
    return html;
  }
  _$jscoverage['/editor/clipboard.js'].lineData[421]++;
  var lang = {
  copy: '\u590d\u5236', 
  paste: '\u7c98\u8d34', 
  cut: '\u526a\u5207'};
  _$jscoverage['/editor/clipboard.js'].lineData[427]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/clipboard.js'].functionData[28]++;
  _$jscoverage['/editor/clipboard.js'].lineData[429]++;
  var currentPaste;
  _$jscoverage['/editor/clipboard.js'].lineData[431]++;
  editor.docReady(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[29]++;
  _$jscoverage['/editor/clipboard.js'].lineData[432]++;
  currentPaste = new Paste(editor);
});
  _$jscoverage['/editor/clipboard.js'].lineData[436]++;
  if (visit50_436_1(0)) {
    _$jscoverage['/editor/clipboard.js'].lineData[437]++;
    var defaultContextMenuFn;
    _$jscoverage['/editor/clipboard.js'].lineData[440]++;
    editor.docReady(defaultContextMenuFn = function() {
  _$jscoverage['/editor/clipboard.js'].functionData[30]++;
  _$jscoverage['/editor/clipboard.js'].lineData[441]++;
  editor.detach('docReady', defaultContextMenuFn);
  _$jscoverage['/editor/clipboard.js'].lineData[442]++;
  var firstFn;
  _$jscoverage['/editor/clipboard.js'].lineData[443]++;
  editor.get('document').on('contextmenu', firstFn = function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[31]++;
  _$jscoverage['/editor/clipboard.js'].lineData[444]++;
  e.preventDefault();
  _$jscoverage['/editor/clipboard.js'].lineData[445]++;
  editor.get('document').detach('contextmenu', firstFn);
  _$jscoverage['/editor/clipboard.js'].lineData[446]++;
  S.use('editor/plugin/contextmenu', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[32]++;
  _$jscoverage['/editor/clipboard.js'].lineData[447]++;
  editor.addContextMenu('default', function() {
  _$jscoverage['/editor/clipboard.js'].functionData[33]++;
  _$jscoverage['/editor/clipboard.js'].lineData[448]++;
  return 1;
}, {
  event: e});
});
});
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[457]++;
  var clipboardCommands = {
  copy: 1, 
  cut: 1, 
  paste: 1};
  _$jscoverage['/editor/clipboard.js'].lineData[462]++;
  var clipboardCommandsList = ['copy', 'cut', 'paste'];
  _$jscoverage['/editor/clipboard.js'].lineData[465]++;
  editor.on('contextmenu', function(ev) {
  _$jscoverage['/editor/clipboard.js'].functionData[34]++;
  _$jscoverage['/editor/clipboard.js'].lineData[466]++;
  var contextmenu = ev.contextmenu, i;
  _$jscoverage['/editor/clipboard.js'].lineData[468]++;
  if (visit51_468_1(!contextmenu.__copyFix)) {
    _$jscoverage['/editor/clipboard.js'].lineData[469]++;
    contextmenu.__copyFix = 1;
    _$jscoverage['/editor/clipboard.js'].lineData[470]++;
    i = 0;
    _$jscoverage['/editor/clipboard.js'].lineData[471]++;
    for (; visit52_471_1(i < clipboardCommandsList.length); i++) {
      _$jscoverage['/editor/clipboard.js'].lineData[472]++;
      contextmenu.addChild({
  content: lang[clipboardCommandsList[i]], 
  value: clipboardCommandsList[i]});
    }
    _$jscoverage['/editor/clipboard.js'].lineData[478]++;
    contextmenu.on('click', function(e) {
  _$jscoverage['/editor/clipboard.js'].functionData[35]++;
  _$jscoverage['/editor/clipboard.js'].lineData[479]++;
  var value = e.target.get('value');
  _$jscoverage['/editor/clipboard.js'].lineData[480]++;
  if (visit53_480_1(clipboardCommands[value])) {
    _$jscoverage['/editor/clipboard.js'].lineData[481]++;
    contextmenu.hide();
    _$jscoverage['/editor/clipboard.js'].lineData[484]++;
    setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[36]++;
  _$jscoverage['/editor/clipboard.js'].lineData[485]++;
  editor.execCommand('save');
  _$jscoverage['/editor/clipboard.js'].lineData[486]++;
  editor.execCommand(value);
  _$jscoverage['/editor/clipboard.js'].lineData[487]++;
  setTimeout(function() {
  _$jscoverage['/editor/clipboard.js'].functionData[37]++;
  _$jscoverage['/editor/clipboard.js'].lineData[488]++;
  editor.execCommand('save');
}, 10);
}, 30);
  }
});
  }
  _$jscoverage['/editor/clipboard.js'].lineData[495]++;
  var menuChildren = contextmenu.get('children');
  _$jscoverage['/editor/clipboard.js'].lineData[498]++;
  for (i = menuChildren.length - 1; visit54_498_1(i >= 0); i >= 0) {
    _$jscoverage['/editor/clipboard.js'].lineData[499]++;
    var c = menuChildren[i];
    _$jscoverage['/editor/clipboard.js'].lineData[500]++;
    var value;
    _$jscoverage['/editor/clipboard.js'].lineData[501]++;
    if (visit55_501_1(c.get)) {
      _$jscoverage['/editor/clipboard.js'].lineData[502]++;
      value = c.get('value');
    } else {
      _$jscoverage['/editor/clipboard.js'].lineData[504]++;
      value = c.value;
    }
    _$jscoverage['/editor/clipboard.js'].lineData[506]++;
    var v;
    _$jscoverage['/editor/clipboard.js'].lineData[507]++;
    if (visit56_507_1(clipboardCommands[value])) {
      _$jscoverage['/editor/clipboard.js'].lineData[508]++;
      v = !currentPaste._stateFromNamedCommand(value);
      _$jscoverage['/editor/clipboard.js'].lineData[509]++;
      if (visit57_509_1(c.set)) {
        _$jscoverage['/editor/clipboard.js'].lineData[510]++;
        c.set('disabled', v);
      } else {
        _$jscoverage['/editor/clipboard.js'].lineData[512]++;
        c.disabled = v;
      }
    }
  }
});
}};
});
