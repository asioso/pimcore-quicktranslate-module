/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

function quickTranslateDocument(documentTranslate) {

    var languagestore = [];

    var websiteLanguages = pimcore.settings.websiteLanguages;
    var selectContent = "";
    for (var i = 0; i < websiteLanguages.length; i++) {
        if (documentTranslate.data.properties["language"] && documentTranslate.data.properties["language"]["data"] != websiteLanguages[i] && isDeeplLanguage(websiteLanguages[i])) {
            selectContent = pimcore.available_languages[websiteLanguages[i]] + " [" + websiteLanguages[i] + "]";
            languagestore.push([websiteLanguages[i], selectContent]);
        }
    }

    var pageForm = new Ext.form.FormPanel({
        border: false,
        defaults: {
            labelWidth: 170
        },
        items: [{
            xtype: "combo",
            name: "language",
            itemId: "language-" + documentTranslate.id,
            store: languagestore,
            editable: false,
            triggerAction: 'all',
            mode: "local",
            fieldLabel: t('language'),
            listeners: {
                select: function (el) {
                    pageForm.getComponent("parent").disable();
                    Ext.Ajax.request({
                        url: "/admin/document/translation-determine-parent",
                        params: {
                            language: el.getValue(),
                            id: documentTranslate.id
                        },
                        success: function (response) {
                            var data = Ext.decode(response.responseText);
                            if (data["success"]) {
                                pageForm.getComponent("parent").setValue(data["targetPath"]);
                            }
                            pageForm.getComponent("parent").enable();
                        }
                    });
                }.bind(this)
            }
        }, {
            xtype: "textfield",
            name: "parent",
            itemId: "parent",
            width: "100%",
            fieldCls: "input_drop_target",
            fieldLabel: t("parent"),
            listeners: {
                "render": function (el) {
                    new Ext.dd.DropZone(el.getEl(), {
                        reference: this,
                        ddGroup: "element",
                        getTargetFromEvent: function (e) {
                            return this.getEl();
                        }.bind(el),

                        onNodeOver: function (target, dd, e, data) {
                            if (data.records.length === 1 && data.records[0].data.elementType === "document") {
                                return Ext.dd.DropZone.prototype.dropAllowed;
                            }
                        },

                        onNodeDrop: function (target, dd, e, data) {

                            if (!pimcore.helpers.dragAndDropValidateSingleItem(data)) {
                                return false;
                            }

                            data = data.records[0].data;
                            if (data.elementType === "document") {
                                this.setValue(data.path);
                                return true;
                            }
                            return false;
                        }.bind(el)
                    });
                }
            }
        }, {
            xtype: "textfield",
            width: "100%",
            fieldLabel: t('key'),
            itemId: "key",
            name: 'key',
            enableKeyEvents: true,
            listeners: {
                keyup: function (el) {
                    pageForm.getComponent("name").setValue(el.getValue());
                }
            }
        }, {
            xtype: "textfield",
            itemId: "name",
            fieldLabel: t('navigation'),
            name: 'name',
            width: "100%"
        }, {
            xtype: "textfield",
            itemId: "title",
            fieldLabel: t('title'),
            name: 'title',
            width: "100%"
        }]
    });

    var win = new Ext.Window({
        title: "Quicktranslate Document",
        width: 600,
        bodyStyle: "padding:10px",
        items: [pageForm],
        buttons: [{
            text: t("cancel"),
            iconCls: "pimcore_icon_delete",
            handler: function () {
                win.close();
            }
        }, {
            text: t("apply"),
            iconCls: "pimcore_icon_apply",
            handler: function () {

                var params = pageForm.getForm().getFieldValues();
                win.disable();

                /* checks if the deepl authentication key exists in your website settings */
                Ext.Ajax.request({
                    url: "/asioso_quick_translate_get_auth_key",
                    success: function (response) {
                        var authKey = Ext.decode(response.responseText);

                        if (authKey.exists) {

                            var key = authKey.authKey;
                            var type = "FREE";
                            if (authKey.type_exists) {
                                type = authKey.type;
                            }
                            var checkerUrl = createDeeplApiUrl(key, type, "", "DE", "EN");

                            /* settings for checker request to deepl */
                            var checkerSettings = {
                                "async": true,
                                "crossDomain": true,
                                "url": checkerUrl,
                                "method": "GET",
                                "headers": {},
                            };

                            $.ajax(checkerSettings).done(function (response) {

                                Ext.Ajax.request({
                                    url: "/admin/element/get-subtype",
                                    params: {
                                        id: pageForm.getComponent("parent").getValue(),
                                        type: "document"
                                    },
                                    success: function (response) {
                                        var res = Ext.decode(response.responseText);
                                        if (res.success) {

                                            if (params["key"].length >= 1) {


                                                /* checks if the document you want to create already exists */
                                                Ext.Ajax.request({
                                                    url: "/asioso_quick_translate_check_if_exists",
                                                    params: {
                                                        key: params["key"],
                                                        parentId: res["id"]
                                                    },

                                                    success: function (response) {
                                                        var exists = JSON.parse(response.responseText);

                                                        if (!exists.exists) {

                                                            params["parentId"] = res["id"];
                                                            params["type"] = documentTranslate.type;
                                                            params["translationsBaseDocument"] = documentTranslate.id;

                                                            var elementsWindow = quickTranslatecreateWindow("Processing", "Getting your content ready for translation...");

                                                            /* get all editables of the document */
                                                            Ext.Ajax.request({
                                                                url: "/asioso_quick_translate_get_document_elements",
                                                                method: 'GET',
                                                                params: {
                                                                    id: documentTranslate.id
                                                                },
                                                                success: function (response) {
                                                                    var elements = JSON.parse(response.responseText, true);

                                                                    if (elements.elements != null) {

                                                                        var xml = "";
                                                                        params["translateDocId"] = documentTranslate.id;

                                                                        Object.keys(elements.elements).forEach(function (key) {
                                                                            xml += '<' + key + ' quick-t-tag="' + key + '"  quick-t-type="' + elements.elements[key]["type"] + '">' + elements.elements[key]["data"] + '</' + key + '>';
                                                                        });



                                                                        var tempWrapper = document.createElement("tempWrapper");

                                                                        tempWrapper.innerHTML = xml;

                                                                        var srcSet = [];
                                                                        Array.from(tempWrapper.getElementsByTagName("img")).forEach(function (image) {
                                                                            srcSet.push(image.src);
                                                                            image.src = "";
                                                                        });

                                                                        var langFrom = documentTranslate.data.properties["language"]["data"].toUpperCase();
                                                                        var langTo = params["language"].toUpperCase();

                                                                        var settings = {
                                                                            "async": true,
                                                                            "crossDomain": true,
                                                                            "url": "",
                                                                            "method": "GET",
                                                                            "headers": {},
                                                                        };

                                                                        xml = tempWrapper.innerHTML.toString();
                                                                        xml = xmlRegReplace(xml);

                                                                        /* if request is to large, divides it into more requests */
                                                                        if (xml.length > 4500) {

                                                                            var partsToTranslate = [];
                                                                            var parts = JSON.parse(xmlToJson(xml, null, true));

                                                                            Object.keys(parts).forEach(function (key) {
                                                                                var part = '<' + key + ' quick-t-tag="' + key + '" quick-t-type="' + parts[key]["type"] + '">' + parts[key]["data"] + '</' + key + '>';
                                                                                partsToTranslate.push(xmlRegReplace(part));
                                                                            });

                                                                            partsToTranslate.sort(function (a, b) {
                                                                                return a.length - b.length;
                                                                            });

                                                                            var translatedParts = [];

                                                                            elementsWindow.destroy();

                                                                            var progressBar = quickTranslateProgressBar();

                                                                            for (var i = 0; i < partsToTranslate.length; i++) {
                                                                                var url = createDeeplApiUrl(key, type, partsToTranslate[i], langFrom, langTo);
                                                                                settings.url = url;

                                                                                $.ajax(settings).done(function (response) {

                                                                                    translatedParts.push(response.translations[0].text);
                                                                                    progressBar[0].updateProgress(translatedParts.length / partsToTranslate.length, "Translating: " + translatedParts.length + " of " + partsToTranslate.length);

                                                                                }).fail(function () {

                                                                                    translatedParts.push(null);
                                                                                    progressBar[0].updateProgress(translatedParts.length / partsToTranslate.length, "Translating: " + translatedParts.length + "/" + partsToTranslate.length);

                                                                                });

                                                                            }

                                                                            /* waits for all the requests to either return the translation or null */
                                                                            var interval = setInterval(function () {
                                                                                if (translatedParts.length === partsToTranslate.length) {

                                                                                    var translatedElements = "Translated elements: " + translatedParts.filter(function (part) {
                                                                                        return part != null;
                                                                                    }).length;

                                                                                    var notTranslatedElements = "Not translated elements: " + translatedParts.filter(function (part) {
                                                                                        return part == null;
                                                                                    }).length;

                                                                                    /* if too many elements couldn't be translated don't save the document */
                                                                                    if (translatedElements > notTranslatedElements) {


                                                                                        params["elements"] = xmlToJson(translatedParts.join(''), srcSet, true);

                                                                                        progressBar[0].text = "";
                                                                                        progressBar[0].updateProgress(100, "Saving");

                                                                                        Ext.Ajax.request({
                                                                                            url: "/asioso_quick_translate_document",
                                                                                            method: 'POST',
                                                                                            params: params,

                                                                                            success: function (response) {
                                                                                                response = Ext.decode(response.responseText);
                                                                                                progressBar[1].destroy();
                                                                                                if (response && response.success) {
                                                                                                    /*pimcore.elementservice.refreshNode(response.id);*/
                                                                                                    reloadDocument(response.id, response.type);

                                                                                                    if (translatedParts.includes(null)) {
                                                                                                        quickTranslatecreateWindow("Success", "Your document was successfully saved, but we couldn't translate all the elements!<br><br>" + translatedElements + "<br>" + notTranslatedElements);
                                                                                                    } else {
                                                                                                        quickTranslatecreateWindow("Success", "Your document was successfully translated and saved!");
                                                                                                    }

                                                                                                } else {
                                                                                                    quickTranslatecreateWindow("Error", "We couldn't save your document beacuse a document with the same path + key already exists!");
                                                                                                }
                                                                                            },

                                                                                            failure: function () {
                                                                                                progressBar[1].destroy();
                                                                                                quickTranslatecreateWindow("Error", "We couldn't translate your document. Internal server error!");
                                                                                            }
                                                                                        });

                                                                                    } else {
                                                                                        progressBar[1].destroy();
                                                                                        quickTranslatecreateWindow("Error", "We couldn't translate your document. Check your internet connection and that you haven't exceeded the maximum amount of translatable characters!");
                                                                                    }

                                                                                    clearInterval(interval);
                                                                                }
                                                                            }, 100);

                                                                        } else {

                                                                            var url = createDeeplApiUrl(key, type, xml, langFrom, langTo);
                                                                            settings.url = url;

                                                                            function deeplAjax(settings) {

                                                                                elementsWindow.destroy();

                                                                                var translatingWindow = quickTranslatecreateWindow("Translating", "Translating your document...");

                                                                                $.ajax(settings).done(function (response) {
                                                                                    params["elements"] = xmlToJson(response.translations[0].text, srcSet, true);

                                                                                    translatingWindow.destroy();

                                                                                    var savingWindow = quickTranslatecreateWindow("Saving", "Saving your translated document...");

                                                                                    Ext.Ajax.request({
                                                                                        url: "/asioso_quick_translate_document",
                                                                                        method: 'POST',
                                                                                        params: params,
                                                                                        success: function (response) {
                                                                                            response = Ext.decode(response.responseText);
                                                                                            if (response && response.success) {

                                                                                                savingWindow.destroy();

                                                                                                reloadDocument(response.id, response.type);
                                                                                                quickTranslatecreateWindow("Success", "Your document was successfully translated and saved!")
                                                                                            } else {
                                                                                                savingWindow.destroy();
                                                                                                quickTranslatecreateWindow("Error", "We couldn't save your document beacuse a document with the same path + key already exists!");
                                                                                            }
                                                                                        }
                                                                                    });

                                                                                }).fail(function () {
                                                                                    translatingWindow.destroy();
                                                                                    quickTranslatecreateWindow("Error", "We couldn't translate your document. Either the document is too large or you have a malformed structure!");
                                                                                });
                                                                            };

                                                                            deeplAjax(settings);
                                                                        }

                                                                        tempWrapper.remove();

                                                                    } else {
                                                                        elementsWindow.destroy();
                                                                        quickTranslatecreateWindow("Empty document", "We couldn't create your document beacuse it is empty!");
                                                                    }

                                                                },

                                                                failure: function () {
                                                                    elementsWindow.destroy();
                                                                    quickTranslatecreateWindow("Error", "We encountered an error while processing your content for translation. Internal server error.");
                                                                }

                                                            });

                                                        } else {
                                                            quickTranslatecreateWindow("Error", "We couldn't save your document beacuse a document with the same path + key already exists!");
                                                        }

                                                    },

                                                    failure: function () {
                                                        quickTranslatecreateWindow("Error", "We couldn't translate your document. Internal server error!");
                                                    }

                                                });

                                            } else {
                                                quickTranslatecreateWindow("Empty key field", "Please insert a valid key for your new document!");
                                            }

                                        } else {
                                            Ext.MessageBox.alert(t("error"), t("element_not_found"));
                                        }

                                        win.close();
                                    }.bind(this)
                                });
                            }).fail(function (response) {

                                var status = response.status;

                                win.destroy();

                                /* creates popup with error message depending on failed request status from deepl */
                                switch (status) {
                                    case 403:
                                        quickTranslatecreateWindow("Authorization failed", "Please insert a valid DeepL authentication key.");
                                        break;
                                    case 456:
                                        quickTranslatecreateWindow("Quota exceeded", "You have reached your character limit.");
                                        break;
                                    case 429:
                                        quickTranslatecreateWindow("Too many requests", "Please wait a few minutes before translating your document again.");
                                        break;
                                    default:
                                        quickTranslatecreateWindow("Connection error", "There seems to be a problem connecting to the DeepL service. Try again later.");
                                        break;
                                }

                            });


                        } else {
                            win.destroy();
                            quickTranslatecreateWindow("Missing authentication key", "Please insert your DeepL authentication key in the Pimcore website settings!");
                        }


                    },

                    failure: function () {
                        quickTranslatecreateWindow("Connection error", "We encountered an error while checking for your DeepL authentication key. Internal server error.");
                    }
                });


            }.bind(this)
        }]
    });

    win.show();
};
