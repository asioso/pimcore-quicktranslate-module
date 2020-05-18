/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

/* creates a window with a progress bar for multiple requests */
function quickTranslateProgressBar() {
    var progressBar = new Ext.ProgressBar({
        text: "Translating"
    });

    var progressWindow = new Ext.window.Window({
        minWidth: 550,
        modal: true,
        layout: 'fit',
        title: "Translating",
        items: [progressBar],
        bodyStyle: "padding: 10px;"
    });

    progressWindow.show();

    return[progressBar, progressWindow];

}