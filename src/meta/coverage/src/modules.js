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
if (! _$jscoverage['/modules.js']) {
  _$jscoverage['/modules.js'] = {};
  _$jscoverage['/modules.js'].lineData = [];
  _$jscoverage['/modules.js'].lineData[2] = 0;
  _$jscoverage['/modules.js'].lineData[3] = 0;
  _$jscoverage['/modules.js'].lineData[270] = 0;
  _$jscoverage['/modules.js'].lineData[275] = 0;
  _$jscoverage['/modules.js'].lineData[276] = 0;
  _$jscoverage['/modules.js'].lineData[277] = 0;
  _$jscoverage['/modules.js'].lineData[278] = 0;
  _$jscoverage['/modules.js'].lineData[279] = 0;
  _$jscoverage['/modules.js'].lineData[281] = 0;
  _$jscoverage['/modules.js'].lineData[283] = 0;
  _$jscoverage['/modules.js'].lineData[286] = 0;
  _$jscoverage['/modules.js'].lineData[287] = 0;
  _$jscoverage['/modules.js'].lineData[298] = 0;
  _$jscoverage['/modules.js'].lineData[305] = 0;
  _$jscoverage['/modules.js'].lineData[306] = 0;
  _$jscoverage['/modules.js'].lineData[309] = 0;
  _$jscoverage['/modules.js'].lineData[310] = 0;
  _$jscoverage['/modules.js'].lineData[313] = 0;
  _$jscoverage['/modules.js'].lineData[314] = 0;
  _$jscoverage['/modules.js'].lineData[317] = 0;
  _$jscoverage['/modules.js'].lineData[318] = 0;
  _$jscoverage['/modules.js'].lineData[321] = 0;
  _$jscoverage['/modules.js'].lineData[322] = 0;
  _$jscoverage['/modules.js'].lineData[325] = 0;
}
if (! _$jscoverage['/modules.js'].functionData) {
  _$jscoverage['/modules.js'].functionData = [];
  _$jscoverage['/modules.js'].functionData[0] = 0;
  _$jscoverage['/modules.js'].functionData[1] = 0;
}
if (! _$jscoverage['/modules.js'].branchData) {
  _$jscoverage['/modules.js'].branchData = {};
  _$jscoverage['/modules.js'].branchData['277'] = [];
  _$jscoverage['/modules.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['290'] = [];
  _$jscoverage['/modules.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['301'] = [];
  _$jscoverage['/modules.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['305'] = [];
  _$jscoverage['/modules.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['309'] = [];
  _$jscoverage['/modules.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['313'] = [];
  _$jscoverage['/modules.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['317'] = [];
  _$jscoverage['/modules.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/modules.js'].branchData['321'] = [];
  _$jscoverage['/modules.js'].branchData['321'][1] = new BranchData();
}
_$jscoverage['/modules.js'].branchData['321'][1].init(6355, 24, '!isTouchGestureSupported');
function visit9_321_1(result) {
  _$jscoverage['/modules.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['317'][1].init(6274, 22, '!win.DeviceMotionEvent');
function visit8_317_1(result) {
  _$jscoverage['/modules.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['313'][1].init(6190, 24, '!isTouchGestureSupported');
function visit7_313_1(result) {
  _$jscoverage['/modules.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['309'][1].init(6107, 24, '!isTouchGestureSupported');
function visit6_309_1(result) {
  _$jscoverage['/modules.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['305'][1].init(6020, 24, '!isTouchGestureSupported');
function visit5_305_1(result) {
  _$jscoverage['/modules.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['301'][1].init(101, 13, 'UA.ieMode < 9');
function visit4_301_1(result) {
  _$jscoverage['/modules.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['290'][1].init(31, 13, 'UA.ieMode < 9');
function visit3_290_1(result) {
  _$jscoverage['/modules.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].branchData['277'][1].init(19, 23, 'typeof name === "string"');
function visit2_277_1(result) {
  _$jscoverage['/modules.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/modules.js'].lineData[2]++;
KISSY.use('ua, feature', function(S, UA, Feature) {
  _$jscoverage['/modules.js'].functionData[0]++;
  _$jscoverage['/modules.js'].lineData[3]++;
  S.config("requires", {
  "anim/base": ["dom", "promise"], 
  "anim/timer": ["anim/base"], 
  "anim/transition": ["anim/base"], 
  "attribute": ["event/custom"], 
  "base": ["attribute"], 
  "button": ["component/control"], 
  "color": ["attribute"], 
  "combobox": ["menu", "io"], 
  "combobox/multi-word": ["combobox"], 
  "component/container": ["component/control"], 
  "component/control": ["node", "event/gesture/basic", "event/gesture/tap", "base", "xtemplate/runtime"], 
  "component/extension/align": ["node", "ua"], 
  "component/extension/delegate-children": ["component/control"], 
  "component/extension/shim": ["ua"], 
  "component/plugin/drag": ["dd"], 
  "component/plugin/resize": ["resizable"], 
  "date/format": ["date/gregorian"], 
  "date/gregorian": ["i18n!date"], 
  "date/picker": ["i18n!date/picker", "component/control", "date/format", "date/picker-xtpl"], 
  "date/popup-picker": ["date/picker", "component/extension/shim", "component/extension/align"], 
  "dd": ["node", "base", "event/gesture/basic", "event/gesture/drag"], 
  "dd/plugin/constrain": ["node", "base"], 
  "dd/plugin/proxy": ["dd"], 
  "dd/plugin/scroll": ["dd"], 
  "dom/base": ["ua"], 
  "dom/class-list": ["dom/base"], 
  "dom/ie": ["dom/base"], 
  "dom/selector": ["dom/basic"], 
  "event": ["event/dom", "event/custom"], 
  "event/base": ["util"], 
  "event/custom": ["event/base"], 
  "event/dom/base": ["event/base", "dom", "ua"], 
  "event/dom/focusin": ["event/dom/base"], 
  "event/dom/hashchange": ["event/dom/base"], 
  "event/dom/ie": ["event/dom/base"], 
  "event/dom/input": ["event/dom/base"], 
  "event/gesture/basic": ["event/gesture/util"], 
  "event/gesture/drag": ["event/gesture/util"], 
  "event/gesture/edge-drag": ["event/gesture/util"], 
  "event/gesture/pinch": ["event/gesture/util"], 
  "event/gesture/rotate": ["event/gesture/util"], 
  "event/gesture/shake": ["event/dom/base"], 
  "event/gesture/swipe": ["event/gesture/util"], 
  "event/gesture/tap": ["event/gesture/util"], 
  "event/gesture/util": ["event/dom/base"], 
  "feature": ["ua"], 
  "filter-menu": ["menu"], 
  "io": ["dom", "event/custom", "promise", "uri", "ua", "event/dom"], 
  "menu": ["component/container", "component/extension/delegate-children", "component/extension/content-box", "component/extension/align", "component/extension/shim"], 
  "menubutton": ["button", "menu"], 
  "navigation-view": ["component/container", "component/extension/content-box"], 
  "navigation-view/bar": ["button"], 
  "node": ["dom", "event/dom", "anim"], 
  "overlay": ["component/container", "component/extension/shim", "component/extension/align", "component/extension/content-box"], 
  "path": ["util"], 
  "resizable": ["dd"], 
  "resizable/plugin/proxy": ["node", "base"], 
  "router": ["uri", "event/dom", "event/custom"], 
  "scroll-view/base": ["anim/timer", "component/container", "component/extension/content-box"], 
  "scroll-view/plugin/pull-to-refresh": ["base"], 
  "scroll-view/plugin/scrollbar": ["component/control", "event/gesture/drag"], 
  "scroll-view/touch": ["scroll-view/base", "event/gesture/drag"], 
  "separator": ["component/control"], 
  "split-button": ["menubutton"], 
  "stylesheet": ["dom"], 
  "swf": ["dom", "json", "attribute"], 
  "tabs": ["toolbar", "button", "component/extension/content-box"], 
  "toolbar": ["component/container", "component/extension/delegate-children"], 
  "tree": ["component/container", "component/extension/content-box", "component/extension/delegate-children"], 
  "uri": ["path"], 
  "xtemplate": ["xtemplate/runtime"], 
  "xtemplate/runtime": ["util"]});
  _$jscoverage['/modules.js'].lineData[270]++;
  var win = window, isTouchGestureSupported = Feature.isTouchGestureSupported(), add = S.add, emptyObject = {};
  _$jscoverage['/modules.js'].lineData[275]++;
  function alias(name, aliasName) {
    _$jscoverage['/modules.js'].functionData[1]++;
    _$jscoverage['/modules.js'].lineData[276]++;
    var cfg;
    _$jscoverage['/modules.js'].lineData[277]++;
    if (visit2_277_1(typeof name === "string")) {
      _$jscoverage['/modules.js'].lineData[278]++;
      cfg = {};
      _$jscoverage['/modules.js'].lineData[279]++;
      cfg[name] = aliasName;
    } else {
      _$jscoverage['/modules.js'].lineData[281]++;
      cfg = name;
    }
    _$jscoverage['/modules.js'].lineData[283]++;
    S.config("alias", cfg);
  }
  _$jscoverage['/modules.js'].lineData[286]++;
  alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
  _$jscoverage['/modules.js'].lineData[287]++;
  alias({
  'dom/basic': ['dom/base', visit3_290_1(UA.ieMode < 9) ? 'dom/ie' : '', Feature.isClassListSupported() ? '' : 'dom/class-list'], 
  dom: ['dom/basic', Feature.isQuerySelectorSupported() ? '' : 'dom/selector']});
  _$jscoverage['/modules.js'].lineData[298]++;
  alias('event/dom', ['event/dom/base', Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange', visit4_301_1(UA.ieMode < 9) ? 'event/dom/ie' : '', Feature.isInputEventSupported() ? '' : 'event/dom/input', UA.ie ? '' : 'event/dom/focusin']);
  _$jscoverage['/modules.js'].lineData[305]++;
  if (visit5_305_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[306]++;
    add('event/gesture/edge-drag', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[309]++;
  if (visit6_309_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[310]++;
    add('event/gesture/pinch', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[313]++;
  if (visit7_313_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[314]++;
    add('event/gesture/rotate', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[317]++;
  if (visit8_317_1(!win.DeviceMotionEvent)) {
    _$jscoverage['/modules.js'].lineData[318]++;
    add('event/gesture/shake', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[321]++;
  if (visit9_321_1(!isTouchGestureSupported)) {
    _$jscoverage['/modules.js'].lineData[322]++;
    add('event/gesture/swipe', emptyObject);
  }
  _$jscoverage['/modules.js'].lineData[325]++;
  alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
});