/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:30
*/
/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */

KISSY.config({
    modules: {
        ajax: {
            alias: 'io'
        }
    }
});

KISSY.config({
    packages: {
        gallery: {
            base: location.protocol === 'https' ?
                'https://s.tbcdn.cn/s/kissy/gallery' : 'http://a.tbcdn.cn/s/kissy/gallery'
        }
    }
});/*jshint indent:false, quotmark:false*/
KISSY.use('ua, feature', function(S, UA, Feature){
S.config("requires",{
    "anim/base": [
        "dom",
        "promise"
    ],
    "anim/timer": [
        "anim/base",
        "feature"
    ],
    "anim/transition": [
        "anim/base",
        "feature"
    ],
    "attribute": [
        "event/custom"
    ],
    "base": [
        "attribute"
    ],
    "button": [
        "component/control"
    ],
    "color": [
        "attribute"
    ],
    "combobox": [
        "menu",
        "io"
    ],
    "combobox/multi-word": [
        "combobox"
    ],
    "component/container": [
        "component/control"
    ],
    "component/control": [
        "node",
        "event/gesture/basic",
        "event/gesture/tap",
        "base",
        "xtemplate/runtime"
    ],
    "component/extension/align": [
        "node",
        "ua"
    ],
    "component/extension/delegate-children": [
        "component/control"
    ],
    "component/extension/shim": [
        "ua"
    ],
    "component/plugin/drag": [
        "dd"
    ],
    "component/plugin/resize": [
        "resizable"
    ],
    "cookie": [
        "util"
    ],
    "date/format": [
        "date/gregorian"
    ],
    "date/gregorian": [
        "util",
        "i18n!date"
    ],
    "date/picker": [
        "i18n!date/picker",
        "component/control",
        "date/format",
        "date/picker-xtpl"
    ],
    "date/popup-picker": [
        "date/picker",
        "component/extension/shim",
        "component/extension/align"
    ],
    "dd": [
        "node",
        "base",
        "event/gesture/basic",
        "event/gesture/drag"
    ],
    "dd/plugin/constrain": [
        "node",
        "base"
    ],
    "dd/plugin/proxy": [
        "dd"
    ],
    "dd/plugin/scroll": [
        "dd"
    ],
    "dom/base": [
        "util",
        "feature"
    ],
    "dom/class-list": [
        "dom/base"
    ],
    "dom/ie": [
        "dom/base"
    ],
    "dom/selector": [
        "util",
        "dom/basic"
    ],
    "event": [
        "event/dom",
        "event/custom"
    ],
    "event/base": [
        "util"
    ],
    "event/custom": [
        "event/base"
    ],
    "event/dom/base": [
        "event/base",
        "dom",
        "ua"
    ],
    "event/dom/focusin": [
        "event/dom/base"
    ],
    "event/dom/hashchange": [
        "event/dom/base"
    ],
    "event/dom/ie": [
        "event/dom/base"
    ],
    "event/dom/input": [
        "event/dom/base"
    ],
    "event/gesture/basic": [
        "event/gesture/util"
    ],
    "event/gesture/drag": [
        "event/gesture/util"
    ],
    "event/gesture/edge-drag": [
        "event/gesture/util"
    ],
    "event/gesture/pinch": [
        "event/gesture/util"
    ],
    "event/gesture/rotate": [
        "event/gesture/util"
    ],
    "event/gesture/shake": [
        "event/dom/base"
    ],
    "event/gesture/swipe": [
        "event/gesture/util"
    ],
    "event/gesture/tap": [
        "event/gesture/util"
    ],
    "event/gesture/util": [
        "event/dom/base",
        "feature"
    ],
    "feature": [
        "ua"
    ],
    "filter-menu": [
        "menu"
    ],
    "html-parser": [
        "util"
    ],
    "io": [
        "dom",
        "event/custom",
        "promise",
        "uri",
        "ua",
        "event/dom"
    ],
    "json": [
        "util"
    ],
    "menu": [
        "component/container",
        "component/extension/delegate-children",
        "component/extension/content-box",
        "component/extension/align",
        "component/extension/shim"
    ],
    "menubutton": [
        "button",
        "menu"
    ],
    "navigation-view": [
        "component/container",
        "component/extension/content-box"
    ],
    "navigation-view/bar": [
        "button"
    ],
    "node": [
        "util",
        "dom",
        "event/dom",
        "anim"
    ],
    "overlay": [
        "component/container",
        "component/extension/shim",
        "component/extension/align",
        "component/extension/content-box"
    ],
    "path": [
        "util"
    ],
    "promise": [
        "util"
    ],
    "resizable": [
        "dd"
    ],
    "resizable/plugin/proxy": [
        "node",
        "base"
    ],
    "router": [
        "uri",
        "event/dom",
        "event/custom",
        "feature"
    ],
    "scroll-view/base": [
        "anim/timer",
        "component/container",
        "component/extension/content-box"
    ],
    "scroll-view/plugin/pull-to-refresh": [
        "base",
        "node",
        "feature"
    ],
    "scroll-view/plugin/scrollbar": [
        "component/control",
        "event/gesture/drag"
    ],
    "scroll-view/touch": [
        "scroll-view/base",
        "event/gesture/drag"
    ],
    "separator": [
        "component/control"
    ],
    "split-button": [
        "menubutton"
    ],
    "stylesheet": [
        "dom"
    ],
    "swf": [
        "dom",
        "json",
        "attribute"
    ],
    "tabs": [
        "toolbar",
        "button",
        "component/extension/content-box"
    ],
    "toolbar": [
        "component/container",
        "component/extension/delegate-children"
    ],
    "tree": [
        "component/container",
        "component/extension/content-box",
        "component/extension/delegate-children"
    ],
    "uri": [
        "path"
    ],
    "xtemplate": [
        "xtemplate/runtime"
    ],
    "xtemplate/runtime": [
        "util"
    ]
});
var win = window,
    isTouchGestureSupported = Feature.isTouchGestureSupported(),
    add = S.add,
    emptyObject = {};

function alias(name, aliasName) {
   var cfg;
   if(typeof name ==="string") {
       cfg = {};
       cfg[name] = aliasName;
   } else {
       cfg = name;
   }
   S.config("alias", cfg);
}

alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
alias({
    'dom/basic': [
        'dom/base',
        UA.ieMode < 9 ? 'dom/ie' : '',
        Feature.isClassListSupported() ? '' : 'dom/class-list'
    ],
    dom: [
        'dom/basic',
        Feature.isQuerySelectorSupported() ? '' : 'dom/selector'
    ]
});
alias('event/dom', [
    'event/dom/base',
    Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange',
        UA.ieMode < 9 ? 'event/dom/ie' : '',
    Feature.isInputEventSupported() ? '' : 'event/dom/input',
    UA.ie ? '' : 'event/dom/focusin'
]);
if (!isTouchGestureSupported) {
    add('event/gesture/edge-drag', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/pinch', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/rotate', emptyObject);
}

if (!win.DeviceMotionEvent) {
    add('event/gesture/shake', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/swipe', emptyObject);
}

alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
});
