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
if (! _$jscoverage['/ie/create.js']) {
  _$jscoverage['/ie/create.js'] = {};
  _$jscoverage['/ie/create.js'].lineData = [];
  _$jscoverage['/ie/create.js'].lineData[6] = 0;
  _$jscoverage['/ie/create.js'].lineData[7] = 0;
  _$jscoverage['/ie/create.js'].lineData[8] = 0;
  _$jscoverage['/ie/create.js'].lineData[10] = 0;
  _$jscoverage['/ie/create.js'].lineData[13] = 0;
  _$jscoverage['/ie/create.js'].lineData[14] = 0;
  _$jscoverage['/ie/create.js'].lineData[19] = 0;
  _$jscoverage['/ie/create.js'].lineData[20] = 0;
  _$jscoverage['/ie/create.js'].lineData[23] = 0;
  _$jscoverage['/ie/create.js'].lineData[26] = 0;
  _$jscoverage['/ie/create.js'].lineData[27] = 0;
  _$jscoverage['/ie/create.js'].lineData[32] = 0;
  _$jscoverage['/ie/create.js'].lineData[33] = 0;
  _$jscoverage['/ie/create.js'].lineData[34] = 0;
  _$jscoverage['/ie/create.js'].lineData[36] = 0;
  _$jscoverage['/ie/create.js'].lineData[40] = 0;
  _$jscoverage['/ie/create.js'].lineData[41] = 0;
  _$jscoverage['/ie/create.js'].lineData[42] = 0;
  _$jscoverage['/ie/create.js'].lineData[47] = 0;
  _$jscoverage['/ie/create.js'].lineData[48] = 0;
  _$jscoverage['/ie/create.js'].lineData[49] = 0;
  _$jscoverage['/ie/create.js'].lineData[51] = 0;
  _$jscoverage['/ie/create.js'].lineData[54] = 0;
  _$jscoverage['/ie/create.js'].lineData[55] = 0;
  _$jscoverage['/ie/create.js'].lineData[58] = 0;
  _$jscoverage['/ie/create.js'].lineData[60] = 0;
  _$jscoverage['/ie/create.js'].lineData[66] = 0;
  _$jscoverage['/ie/create.js'].lineData[69] = 0;
  _$jscoverage['/ie/create.js'].lineData[74] = 0;
  _$jscoverage['/ie/create.js'].lineData[77] = 0;
  _$jscoverage['/ie/create.js'].lineData[78] = 0;
  _$jscoverage['/ie/create.js'].lineData[80] = 0;
  _$jscoverage['/ie/create.js'].lineData[81] = 0;
  _$jscoverage['/ie/create.js'].lineData[83] = 0;
  _$jscoverage['/ie/create.js'].lineData[85] = 0;
  _$jscoverage['/ie/create.js'].lineData[86] = 0;
  _$jscoverage['/ie/create.js'].lineData[87] = 0;
  _$jscoverage['/ie/create.js'].lineData[90] = 0;
}
if (! _$jscoverage['/ie/create.js'].functionData) {
  _$jscoverage['/ie/create.js'].functionData = [];
  _$jscoverage['/ie/create.js'].functionData[0] = 0;
  _$jscoverage['/ie/create.js'].functionData[1] = 0;
  _$jscoverage['/ie/create.js'].functionData[2] = 0;
  _$jscoverage['/ie/create.js'].functionData[3] = 0;
}
if (! _$jscoverage['/ie/create.js'].branchData) {
  _$jscoverage['/ie/create.js'].branchData = {};
  _$jscoverage['/ie/create.js'].branchData['13'] = [];
  _$jscoverage['/ie/create.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['19'] = [];
  _$jscoverage['/ie/create.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['26'] = [];
  _$jscoverage['/ie/create.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['32'] = [];
  _$jscoverage['/ie/create.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'] = [];
  _$jscoverage['/ie/create.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['36'] = [];
  _$jscoverage['/ie/create.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['36'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['36'][4] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['36'][5] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['41'] = [];
  _$jscoverage['/ie/create.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['48'] = [];
  _$jscoverage['/ie/create.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['51'] = [];
  _$jscoverage['/ie/create.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['55'] = [];
  _$jscoverage['/ie/create.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['74'] = [];
  _$jscoverage['/ie/create.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['80'] = [];
  _$jscoverage['/ie/create.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['86'] = [];
  _$jscoverage['/ie/create.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['86'][2] = new BranchData();
}
_$jscoverage['/ie/create.js'].branchData['86'][2].init(22, 27, 'Dom.nodeName(c) === \'tbody\'');
function visit38_86_2(result) {
  _$jscoverage['/ie/create.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['86'][1].init(22, 51, 'Dom.nodeName(c) === \'tbody\' && !c.childNodes.length');
function visit37_86_1(result) {
  _$jscoverage['/ie/create.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['80'][1].init(122, 8, 'hasTBody');
function visit36_80_1(result) {
  _$jscoverage['/ie/create.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['74'][1].init(2960, 24, 'require(\'ua\').ieMode < 8');
function visit35_74_1(result) {
  _$jscoverage['/ie/create.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['55'][3].init(2072, 23, 'nodeName === \'textarea\'');
function visit34_55_3(result) {
  _$jscoverage['/ie/create.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['55'][2].init(2048, 20, 'nodeName === \'input\'');
function visit33_55_2(result) {
  _$jscoverage['/ie/create.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['55'][1].init(2048, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit32_55_1(result) {
  _$jscoverage['/ie/create.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['51'][1].init(1827, 21, 'nodeName === \'option\'');
function visit31_51_1(result) {
  _$jscoverage['/ie/create.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['48'][1].init(591, 23, 'dest.value !== srcValue');
function visit30_48_1(result) {
  _$jscoverage['/ie/create.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['41'][1].init(293, 10, 'srcChecked');
function visit29_41_1(result) {
  _$jscoverage['/ie/create.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['36'][5].init(1113, 16, 'type === \'radio\'');
function visit28_36_5(result) {
  _$jscoverage['/ie/create.js'].branchData['36'][5].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['36'][4].init(1090, 19, 'type === \'checkbox\'');
function visit27_36_4(result) {
  _$jscoverage['/ie/create.js'].branchData['36'][4].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['36'][3].init(1090, 39, 'type === \'checkbox\' || type === \'radio\'');
function visit26_36_3(result) {
  _$jscoverage['/ie/create.js'].branchData['36'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['36'][2].init(1065, 20, 'nodeName === \'input\'');
function visit25_36_2(result) {
  _$jscoverage['/ie/create.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['36'][1].init(1065, 65, 'nodeName === \'input\' && (type === \'checkbox\' || type === \'radio\')');
function visit24_36_1(result) {
  _$jscoverage['/ie/create.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][1].init(30, 22, 'i < srcChildren.length');
function visit23_33_1(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['32'][2].init(850, 21, 'nodeName === \'object\'');
function visit22_32_2(result) {
  _$jscoverage['/ie/create.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['32'][1].init(850, 48, 'nodeName === \'object\' && !dest.childNodes.length');
function visit21_32_1(result) {
  _$jscoverage['/ie/create.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['26'][1].init(556, 14, 'src.type || \'\'');
function visit20_26_1(result) {
  _$jscoverage['/ie/create.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['19'][1].init(360, 20, 'dest.mergeAttributes');
function visit19_19_1(result) {
  _$jscoverage['/ie/create.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['13'][1].init(159, 20, 'dest.clearAttributes');
function visit18_13_1(result) {
  _$jscoverage['/ie/create.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/create.js'].functionData[0]++;
  _$jscoverage['/ie/create.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/ie/create.js'].lineData[8]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/create.js'].lineData[10]++;
  Dom._fixCloneAttributes = function(src, dest) {
  _$jscoverage['/ie/create.js'].functionData[1]++;
  _$jscoverage['/ie/create.js'].lineData[13]++;
  if (visit18_13_1(dest.clearAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[14]++;
    dest.clearAttributes();
  }
  _$jscoverage['/ie/create.js'].lineData[19]++;
  if (visit19_19_1(dest.mergeAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[20]++;
    dest.mergeAttributes(src);
  }
  _$jscoverage['/ie/create.js'].lineData[23]++;
  var nodeName = dest.nodeName.toLowerCase(), srcChildren = src.childNodes;
  _$jscoverage['/ie/create.js'].lineData[26]++;
  var type = (visit20_26_1(src.type || '')).toLowerCase();
  _$jscoverage['/ie/create.js'].lineData[27]++;
  var srcValue, srcChecked;
  _$jscoverage['/ie/create.js'].lineData[32]++;
  if (visit21_32_1(visit22_32_2(nodeName === 'object') && !dest.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[33]++;
    for (var i = 0; visit23_33_1(i < srcChildren.length); i++) {
      _$jscoverage['/ie/create.js'].lineData[34]++;
      dest.appendChild(srcChildren[i].cloneNode(true));
    }
  } else {
    _$jscoverage['/ie/create.js'].lineData[36]++;
    if (visit24_36_1(visit25_36_2(nodeName === 'input') && (visit26_36_3(visit27_36_4(type === 'checkbox') || visit28_36_5(type === 'radio'))))) {
      _$jscoverage['/ie/create.js'].lineData[40]++;
      srcChecked = src.checked;
      _$jscoverage['/ie/create.js'].lineData[41]++;
      if (visit29_41_1(srcChecked)) {
        _$jscoverage['/ie/create.js'].lineData[42]++;
        dest.defaultChecked = dest.checked = srcChecked;
      }
      _$jscoverage['/ie/create.js'].lineData[47]++;
      srcValue = src.value;
      _$jscoverage['/ie/create.js'].lineData[48]++;
      if (visit30_48_1(dest.value !== srcValue)) {
        _$jscoverage['/ie/create.js'].lineData[49]++;
        dest.value = srcValue;
      }
    } else {
      _$jscoverage['/ie/create.js'].lineData[51]++;
      if (visit31_51_1(nodeName === 'option')) {
        _$jscoverage['/ie/create.js'].lineData[54]++;
        dest.selected = src.defaultSelected;
      } else {
        _$jscoverage['/ie/create.js'].lineData[55]++;
        if (visit32_55_1(visit33_55_2(nodeName === 'input') || visit34_55_3(nodeName === 'textarea'))) {
          _$jscoverage['/ie/create.js'].lineData[58]++;
          dest.defaultValue = src.defaultValue;
          _$jscoverage['/ie/create.js'].lineData[60]++;
          dest.value = src.value;
        }
      }
    }
  }
  _$jscoverage['/ie/create.js'].lineData[66]++;
  dest.removeAttribute(Dom.__EXPANDO);
};
  _$jscoverage['/ie/create.js'].lineData[69]++;
  var creators = Dom._creators, defaultCreator = Dom._defaultCreator, R_TBODY = /<tbody/i;
  _$jscoverage['/ie/create.js'].lineData[74]++;
  if (visit35_74_1(require('ua').ieMode < 8)) {
    _$jscoverage['/ie/create.js'].lineData[77]++;
    creators.table = function(html, ownerDoc) {
  _$jscoverage['/ie/create.js'].functionData[2]++;
  _$jscoverage['/ie/create.js'].lineData[78]++;
  var frag = defaultCreator(html, ownerDoc), hasTBody = R_TBODY.test(html);
  _$jscoverage['/ie/create.js'].lineData[80]++;
  if (visit36_80_1(hasTBody)) {
    _$jscoverage['/ie/create.js'].lineData[81]++;
    return frag;
  }
  _$jscoverage['/ie/create.js'].lineData[83]++;
  var table = frag.firstChild, tableChildren = util.makeArray(table.childNodes);
  _$jscoverage['/ie/create.js'].lineData[85]++;
  util.each(tableChildren, function(c) {
  _$jscoverage['/ie/create.js'].functionData[3]++;
  _$jscoverage['/ie/create.js'].lineData[86]++;
  if (visit37_86_1(visit38_86_2(Dom.nodeName(c) === 'tbody') && !c.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[87]++;
    table.removeChild(c);
  }
});
  _$jscoverage['/ie/create.js'].lineData[90]++;
  return frag;
};
  }
});
