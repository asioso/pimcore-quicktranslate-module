/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

/* dynamically creates popup window */

function quickTranslatecreateWindow(title, text, success = false, objectID = null) {
    var window = new Ext.window.Window({
        minHeight: 150,
        minWidth: 350,
        maxWidth: 700,
        modal: true,
        layout: 'fit',
        bodyStyle: "padding: 10px;",
        title: title,
        html: text,
        buttons: success == false && objectID == null ? "" : [
            {
                text    : 'Reload',
                handler : function () {
                    window.destroy();
                    pimcore.helpers.closeObject(objectID);
                    pimcore.helpers.openObject(objectID);
                }
            }
        ]
    });

    window.show();

    return window;
}