/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
/*
combined modules:
editor/plugin/justify-right
*/
/**
 * @ignore
 * justifyRight button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/justify-right', [
    'editor',
    './justify-right/cmd',
    './button',
    'node'
], function (S, require) {
    var Editor = require('editor');
    var justifyCenterCmd = require('./justify-right/cmd');
    require('./button');
    var Node = require('node');
    function exec() {
        var editor = this.get('editor');
        editor.execCommand('justifyRight');
        editor.focus();
    }
    function justifyRight() {
    }
    justifyRight.prototype = {
        pluginRenderUI: function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton('justifyRight', {
                tooltip: '\u53F3\u5BF9\u9F50',
                checkable: true,
                listeners: {
                    click: exec,
                    afterSyncUI: function () {
                        var self = this;
                        editor.on('selectionChange', function () {
                            if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                                return;
                            }
                            if (editor.queryCommandValue('justifyRight')) {
                                self.set('checked', true);
                            } else {
                                self.set('checked', false);
                            }
                        });
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === Node.KeyCode.R) {
                        editor.execCommand('justifyRight');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    return justifyRight;
});



