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
if (! _$jscoverage['/io/form.js']) {
  _$jscoverage['/io/form.js'] = {};
  _$jscoverage['/io/form.js'].lineData = [];
  _$jscoverage['/io/form.js'].lineData[6] = 0;
  _$jscoverage['/io/form.js'].lineData[7] = 0;
  _$jscoverage['/io/form.js'].lineData[8] = 0;
  _$jscoverage['/io/form.js'].lineData[9] = 0;
  _$jscoverage['/io/form.js'].lineData[10] = 0;
  _$jscoverage['/io/form.js'].lineData[11] = 0;
  _$jscoverage['/io/form.js'].lineData[15] = 0;
  _$jscoverage['/io/form.js'].lineData[16] = 0;
  _$jscoverage['/io/form.js'].lineData[26] = 0;
  _$jscoverage['/io/form.js'].lineData[27] = 0;
  _$jscoverage['/io/form.js'].lineData[28] = 0;
  _$jscoverage['/io/form.js'].lineData[29] = 0;
  _$jscoverage['/io/form.js'].lineData[30] = 0;
  _$jscoverage['/io/form.js'].lineData[32] = 0;
  _$jscoverage['/io/form.js'].lineData[33] = 0;
  _$jscoverage['/io/form.js'].lineData[34] = 0;
  _$jscoverage['/io/form.js'].lineData[35] = 0;
  _$jscoverage['/io/form.js'].lineData[36] = 0;
  _$jscoverage['/io/form.js'].lineData[37] = 0;
  _$jscoverage['/io/form.js'].lineData[38] = 0;
  _$jscoverage['/io/form.js'].lineData[40] = 0;
  _$jscoverage['/io/form.js'].lineData[41] = 0;
  _$jscoverage['/io/form.js'].lineData[45] = 0;
  _$jscoverage['/io/form.js'].lineData[46] = 0;
  _$jscoverage['/io/form.js'].lineData[47] = 0;
  _$jscoverage['/io/form.js'].lineData[49] = 0;
  _$jscoverage['/io/form.js'].lineData[53] = 0;
  _$jscoverage['/io/form.js'].lineData[56] = 0;
  _$jscoverage['/io/form.js'].lineData[57] = 0;
  _$jscoverage['/io/form.js'].lineData[58] = 0;
  _$jscoverage['/io/form.js'].lineData[59] = 0;
  _$jscoverage['/io/form.js'].lineData[60] = 0;
  _$jscoverage['/io/form.js'].lineData[62] = 0;
  _$jscoverage['/io/form.js'].lineData[66] = 0;
  _$jscoverage['/io/form.js'].lineData[70] = 0;
  _$jscoverage['/io/form.js'].lineData[71] = 0;
  _$jscoverage['/io/form.js'].lineData[72] = 0;
  _$jscoverage['/io/form.js'].lineData[73] = 0;
  _$jscoverage['/io/form.js'].lineData[75] = 0;
  _$jscoverage['/io/form.js'].lineData[76] = 0;
  _$jscoverage['/io/form.js'].lineData[77] = 0;
  _$jscoverage['/io/form.js'].lineData[82] = 0;
}
if (! _$jscoverage['/io/form.js'].functionData) {
  _$jscoverage['/io/form.js'].functionData = [];
  _$jscoverage['/io/form.js'].functionData[0] = 0;
  _$jscoverage['/io/form.js'].functionData[1] = 0;
}
if (! _$jscoverage['/io/form.js'].branchData) {
  _$jscoverage['/io/form.js'].branchData = {};
  _$jscoverage['/io/form.js'].branchData['26'] = [];
  _$jscoverage['/io/form.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['33'] = [];
  _$jscoverage['/io/form.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['35'] = [];
  _$jscoverage['/io/form.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['37'] = [];
  _$jscoverage['/io/form.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['41'] = [];
  _$jscoverage['/io/form.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['45'] = [];
  _$jscoverage['/io/form.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['46'] = [];
  _$jscoverage['/io/form.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['53'] = [];
  _$jscoverage['/io/form.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['57'] = [];
  _$jscoverage['/io/form.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['59'] = [];
  _$jscoverage['/io/form.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/io/form.js'].branchData['72'] = [];
  _$jscoverage['/io/form.js'].branchData['72'][1] = new BranchData();
}
_$jscoverage['/io/form.js'].branchData['72'][1].init(127, 9, 'd === \'*\'');
function visit47_72_1(result) {
  _$jscoverage['/io/form.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['59'][1].init(122, 4, 'data');
function visit46_59_1(result) {
  _$jscoverage['/io/form.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['57'][1].init(201, 12, 'c.hasContent');
function visit45_57_1(result) {
  _$jscoverage['/io/form.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['53'][1].init(982, 21, '!isUpload || FormData');
function visit44_53_1(result) {
  _$jscoverage['/io/form.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['46'][1].init(28, 13, 'c.files || {}');
function visit43_46_1(result) {
  _$jscoverage['/io/form.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['45'][1].init(705, 20, 'isUpload && FormData');
function visit42_45_1(result) {
  _$jscoverage['/io/form.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['41'][2].init(284, 19, 'selected[0] || null');
function visit41_41_2(result) {
  _$jscoverage['/io/form.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['41'][1].init(250, 19, 'selected.length > 1');
function visit40_41_1(result) {
  _$jscoverage['/io/form.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['37'][1].init(64, 9, '!FormData');
function visit39_37_1(result) {
  _$jscoverage['/io/form.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['35'][1].init(62, 35, 'input.type.toLowerCase() === \'file\'');
function visit38_35_1(result) {
  _$jscoverage['/io/form.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['33'][1].init(233, 5, 'i < l');
function visit37_33_1(result) {
  _$jscoverage['/io/form.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].branchData['26'][1].init(237, 7, 'tmpForm');
function visit36_26_1(result) {
  _$jscoverage['/io/form.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/form.js'].functionData[0]++;
  _$jscoverage['/io/form.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/form.js'].lineData[8]++;
  var IO = require('./base');
  _$jscoverage['/io/form.js'].lineData[9]++;
  var Dom = require('dom');
  _$jscoverage['/io/form.js'].lineData[10]++;
  var FormSerializer = require('./form-serializer');
  _$jscoverage['/io/form.js'].lineData[11]++;
  var win = S.Env.host, slice = Array.prototype.slice, FormData = win.FormData;
  _$jscoverage['/io/form.js'].lineData[15]++;
  IO.on('start', function(e) {
  _$jscoverage['/io/form.js'].functionData[1]++;
  _$jscoverage['/io/form.js'].lineData[16]++;
  var io = e.io, form, d, dataType, formParam, data, c = io.config, tmpForm = c.form;
  _$jscoverage['/io/form.js'].lineData[26]++;
  if (visit36_26_1(tmpForm)) {
    _$jscoverage['/io/form.js'].lineData[27]++;
    form = Dom.get(tmpForm);
    _$jscoverage['/io/form.js'].lineData[28]++;
    data = c.data;
    _$jscoverage['/io/form.js'].lineData[29]++;
    var isUpload = false;
    _$jscoverage['/io/form.js'].lineData[30]++;
    var files = {};
    _$jscoverage['/io/form.js'].lineData[32]++;
    var inputs = Dom.query('input', form);
    _$jscoverage['/io/form.js'].lineData[33]++;
    for (var i = 0, l = inputs.length; visit37_33_1(i < l); i++) {
      _$jscoverage['/io/form.js'].lineData[34]++;
      var input = inputs[i];
      _$jscoverage['/io/form.js'].lineData[35]++;
      if (visit38_35_1(input.type.toLowerCase() === 'file')) {
        _$jscoverage['/io/form.js'].lineData[36]++;
        isUpload = true;
        _$jscoverage['/io/form.js'].lineData[37]++;
        if (visit39_37_1(!FormData)) {
          _$jscoverage['/io/form.js'].lineData[38]++;
          break;
        }
        _$jscoverage['/io/form.js'].lineData[40]++;
        var selected = slice.call(input.files, 0);
        _$jscoverage['/io/form.js'].lineData[41]++;
        files[Dom.attr(input, 'name')] = visit40_41_1(selected.length > 1) ? selected : (visit41_41_2(selected[0] || null));
      }
    }
    _$jscoverage['/io/form.js'].lineData[45]++;
    if (visit42_45_1(isUpload && FormData)) {
      _$jscoverage['/io/form.js'].lineData[46]++;
      c.files = visit43_46_1(c.files || {});
      _$jscoverage['/io/form.js'].lineData[47]++;
      util.mix(c.files, files);
      _$jscoverage['/io/form.js'].lineData[49]++;
      delete c.contentType;
    }
    _$jscoverage['/io/form.js'].lineData[53]++;
    if (visit44_53_1(!isUpload || FormData)) {
      _$jscoverage['/io/form.js'].lineData[56]++;
      formParam = FormSerializer.getFormData(form);
      _$jscoverage['/io/form.js'].lineData[57]++;
      if (visit45_57_1(c.hasContent)) {
        _$jscoverage['/io/form.js'].lineData[58]++;
        formParam = util.param(formParam, undefined, undefined, c.serializeArray);
        _$jscoverage['/io/form.js'].lineData[59]++;
        if (visit46_59_1(data)) {
          _$jscoverage['/io/form.js'].lineData[60]++;
          c.data += '&' + formParam;
        } else {
          _$jscoverage['/io/form.js'].lineData[62]++;
          c.data = formParam;
        }
      } else {
        _$jscoverage['/io/form.js'].lineData[66]++;
        c.uri.query.add(formParam);
      }
    } else {
      _$jscoverage['/io/form.js'].lineData[70]++;
      dataType = c.dataType;
      _$jscoverage['/io/form.js'].lineData[71]++;
      d = dataType[0];
      _$jscoverage['/io/form.js'].lineData[72]++;
      if (visit47_72_1(d === '*')) {
        _$jscoverage['/io/form.js'].lineData[73]++;
        d = 'text';
      }
      _$jscoverage['/io/form.js'].lineData[75]++;
      dataType.length = 2;
      _$jscoverage['/io/form.js'].lineData[76]++;
      dataType[0] = 'iframe';
      _$jscoverage['/io/form.js'].lineData[77]++;
      dataType[1] = d;
    }
  }
});
  _$jscoverage['/io/form.js'].lineData[82]++;
  return IO;
});
