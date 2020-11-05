/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

pimcore.registerNS("pimcore.plugin.asiosoQuickTranslateBundle");

pimcore.plugin.asiosoQuickTranslateBundle = Class.create(pimcore.plugin.admin, {
    getClassName: function () {
        return "pimcore.plugin.asiosoQuickTranslateBundle";
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {

    },

    postOpenObject: function (object, type) {
        /* add quickTranslate icon to objects with localizedfields */
        if (type === "object") {
            if (object.data.data.hasOwnProperty("localizedfields")) {
                object.tabbar.add(new pimcore.element.quickTranslateObjectBtn(object, "object").getLayout());
            }
        }
    },


    postOpenDocument: function (document, type) {
        /* add quicktranslate button to specific document type */
        if (type == "page" || type == "snippet" || type == "printpage") {

            /* checks if document language is supported by deepl and ads the button if it is */
            if (Ext.isIE) {
                /*if (deeplLanguages.indexOf(document.data.properties["language"]["data"])) {
                    this.docBtn(document);
                }*/
            } else {
                if (isDeeplLanguage(document.data.properties["language"]["data"])) {
                    this.docBtn(document);
                }
            }


        }

    },


    docBtn: function (document) {

        var menuParent;
        if (document.data.locked) {
            menuParent = document.toolbar.items.items[6].btnInnerEl.component.menu.items.items[0].menu;
        } else {
            if(document.data.id == 1 ){
                menuParent = document.toolbar.items.items[7].btnInnerEl.component.menu.items.items[0].menu;
            }else{
                menuParent = document.toolbar.items.items[9].btnInnerEl.component.menu.items.items[0].menu;
            } 
        }

        menuParent.add({
            text: t('Quick Translate'),
            iconCls: 'quick-translate-icon',
            scale: 'small',
            handler: function () {
                quickTranslateDocument(document)
            }
        });
    }

});

var asiosoQuickTranslateBundlePlugin = new pimcore.plugin.asiosoQuickTranslateBundle();

