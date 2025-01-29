/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

pimcore.registerNS("pimcore.plugin.asiosoQuickTranslateBundle");

pimcore.plugin.asiosoQuickTranslateBundle = Class.create({
    getClassName: function () {
        return "pimcore.plugin.asiosoQuickTranslateBundle";
    },

    initialize: function () {
        document.addEventListener(pimcore.events.postOpenObject, this.postOpenObject.bind(this));
        document.addEventListener(pimcore.events.postOpenDocument, this.postOpenDocument.bind(this));
    },

    pimcoreReady: function (params, broker) {

    },

    postOpenObject: function (event) {
        /* add quickTranslate icon to objects with localizedfields */
        const { detail: { object, type } } = event;
        if (type === "object") {
            if (object.data.data.hasOwnProperty("localizedfields")) {
                object.tabbar.add(new pimcore.element.quickTranslateObjectBtn(object, "object").getLayout());
            } else if (object.data.data) {
                let objectData = object.data.data;
                for (let item in objectData) {
                    if (Array.isArray(objectData[item])) {
                        objectData[item].forEach((element) => {
                            if (objectData[item].length && element.data.localizedfields) {
                                object.tabbar.add(new pimcore.element.quickTranslateObjectBtn(object, "object").getLayout());
                            }
                        })
                    } else if (!Array.isArray(objectData[item]) && typeof objectData[item] === 'object' && objectData[item] !== null && objectData[item].hasOwnProperty('activeGroups')) {
                        object.tabbar.add(new pimcore.element.quickTranslateObjectBtn(object, "object").getLayout());
                    }
                }
            }
        }
    },


    postOpenDocument: function (event) {
        /* add quicktranslate button to specific document type */
        const { detail: { document, type } } = event;
        if (type == "page" || type == "snippet" || type == "printpage") {

            /* checks if document language is supported by deepl and ads the button if it is */
            if (Ext.isIE) {
                /*if (deeplLanguages.indexOf(document.data.properties["language"]["data"])) {
                    this.docBtn(document);
                }*/
            } else {
                if (document.data.properties["language"] && isDeeplLanguage(document.data.properties["language"]["data"])) {
                    this.docBtn(document);
                }
            }


        }

    },


    docBtn: function (document) {
        var menuParent;

        var toolbarItems = document.toolbar.items.items;

        var menuButton = toolbarItems.find(item => {
            return (
                item.btnInnerEl?.component?.menu?.items?.items &&
                item.btnInnerEl.component.menu.items.items[0]?.menu
            );
        });

        if (!menuButton) {
            console.error("Menu button not found.");
            return;
        }

        if (document.data.locked) {
            menuParent = menuButton.btnInnerEl.component.menu.items.items[0].menu;
        } else {
            menuParent = menuButton.btnInnerEl.component.menu.items.items[0].menu;
        }

        menuParent.add({
            text: t('Quick Translate'),
            iconCls: 'quick-translate-icon',
            scale: 'small',
            handler: function () {
                quickTranslateDocument(document);
            }
        });
    }

});

var asiosoQuickTranslateBundlePlugin = new pimcore.plugin.asiosoQuickTranslateBundle();

