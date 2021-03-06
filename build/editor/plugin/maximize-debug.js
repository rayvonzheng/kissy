/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
/*
combined modules:
editor/plugin/maximize
*/
/**
 * @ignore
 * Maximize plugin
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/maximize', [
    './maximize/cmd',
    './button'
], function (S, require) {
    var maximizeCmd = require('./maximize/cmd');
    require('./button');
    var MAXIMIZE_CLASS = 'maximize', RESTORE_CLASS = 'restore', MAXIMIZE_TIP = '\u5168\u5C4F', RESTORE_TIP = '\u53D6\u6D88\u5168\u5C4F';
    function maximizePlugin() {
    }
    maximizePlugin.prototype = {
        pluginRenderUI: function (editor) {
            maximizeCmd.init(editor);
            editor.addButton('maximize', {
                tooltip: MAXIMIZE_TIP,
                listeners: {
                    click: function () {
                        var self = this;
                        var checked = self.get('checked');
                        if (checked) {
                            editor.execCommand('maximizeWindow');
                            self.set('tooltip', RESTORE_TIP);
                            self.set('contentCls', RESTORE_CLASS);
                        } else {
                            editor.execCommand('restoreWindow');
                            self.set('tooltip', MAXIMIZE_TIP);
                            self.set('contentCls', MAXIMIZE_CLASS);
                        }
                        editor.focus();
                    }
                },
                checkable: true
            });
        }
    };
    return maximizePlugin;
});

