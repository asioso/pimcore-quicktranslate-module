/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

pimcore.registerNS("pimcore.element.quickTranslateObjectBtn");
pimcore.element.quickTranslateObjectBtn = Class.create({

    initialize: function (element) {

        this.element = element;

    },


    getLayout: function () {

        if (this.layout == null) {

            var langs = this.getLangExtStore(this.getLanguages(), ["id", "name"]);

            var langFrom = new Ext.form.ComboBox({
                id: 'langFrom' + this.element.id,
                name: "langFrom" + this.element.id,
                valueField: "id",
                displayField: 'name',
                store: langs,
                editable: false,
                triggerAction: 'all',
                mode: "local",
                listWidth: 200,
                maxWidth: 200,
                maxHeight: 30,
                emptyText: 'Choose language'
            });

            var langTo = new Ext.form.ComboBox({
                id: 'langTo' + this.element.id,
                name: "langTo" + this.element.id,
                valueField: "id",
                displayField: 'name',
                store: langs,
                editable: false,
                triggerAction: 'all',
                mode: "local",
                listWidth: 200,
                maxWidth: 200,
                maxHeight: 30,
                emptyText: 'Choose language'
            });


            var panel = new Ext.Panel({
                id: 'quickTranslate-leftPanel' + this.element.id,
                title: "Translate",
                width: 300,
                items: [langFrom, langTo]
            });

            Ext.getCmp('quickTranslate-leftPanel' + this.element.id).add({
                xtype: 'button',
                text: 'Translate',
                cls: 'quickTranslate-translate-btn',
                listeners: {
                    click: function () {

                        /* checks if the deepl authentication key exists in your website settings */
                        Ext.Ajax.request({
                            url: "/asioso_quick_translate_get_auth_key",
                            success: function (response) {
                                var authKey = Ext.decode(response.responseText);

                                if (authKey.exists) {

                                    /* deepl authentication key */
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

                                        var langs = this.getSelectedLangs('langFrom' + this.element.id, 'langTo' + this.element.id);

                                        if (!langs.includes(null)) {

                                            var data = {},
                                                xmlStr = "",
                                                elementData = this.element.data.data;
                                            if (elementData.hasOwnProperty('localizedfields')) {
                                                data = { ...data, ...elementData.localizedfields.data[langs[0]] }
                                            }
                                            for (let item in elementData) {
                                                if (Array.isArray(elementData[item])) {
                                                    elementData[item].forEach((element, index) => {
                                                        if(element !== null && element.data?.localizedfields !== undefined) {
                                                            if (elementData[item].length && element.data.localizedfields.data[langs[0]]) {
                                                                let localizedFields = element.data.localizedfields.data[langs[0]];
                                                                for (let field in localizedFields) {
                                                                    localizedFields[`structuredData#.${item}.${index}.${element.type}.${field}`] = localizedFields[field];
                                                                    delete localizedFields[field];
                                                                }
                                                                data = {...data, ...localizedFields}
                                                            }
                                                        }
                                                    })
                                                } else if (!Array.isArray(elementData[item]) && typeof elementData[item] === 'object' && elementData[item] !== null && elementData[item].hasOwnProperty('activeGroups')) {
                                                    if (elementData[item].data[langs[0]]) {
                                                        let localizedFields = elementData[item].data[langs[0]];
                                                        for (let storeObject in localizedFields) {
                                                            for (let field in localizedFields[storeObject]) {
                                                                localizedFields[storeObject][`classificationStore#.${storeObject}.${item}.${field}`] = localizedFields[storeObject][field];
                                                                delete localizedFields[storeObject][field];
                                                            }
                                                            data = { ...data, ...localizedFields[storeObject] }
                                                        }
                                                    }
                                                }
                                            }


                                            for (var field in data) {

                                                if (Array.isArray(data[field]) && data[field].length > 0 && data[field][0].__proto__.join) {
                                                    var arr = data[field].map(function (subarr) {
                                                        return subarr.map(function (cell) {
                                                            return (cell == "" ? " " : cell);
                                                        });
                                                    });
                                                    var str = "<" + field + " quick-t-tag='" + field + "' quick-t-type='table'>" + arr.join("|").replace(/\r?\n|\r/g, "\|\|\|") + "</" + field + ">";
                                                    xmlStr += str;

                                                } else if (typeof data[field] === "string") {
                                                    var escaped = data[field].replace(/>/g, "(gT)").replace(/</g, "(lT)");
                                                    var str = "<" + field + " quick-t-tag='" + field + "'>" + escaped + "</" + field + ">";
                                                    xmlStr += str;
                                                }
                                            }

                                            xmlStr = xmlRegReplace(xmlStr);

                                            var imgDiv = document.createElement("temporaryWrapper");

                                            imgDiv.innerHTML = xmlStr;

                                            var srcSet = [];
                                            Array.from(imgDiv.getElementsByTagName("img")).forEach(function (image) {
                                                srcSet.push(image.src);
                                                image.src = "";
                                            });


                                            if (xmlStr.length > 4500) {
                                                var partsToTranslate = [];
                                                var i = 0;
                                                var inputs = [];
                                                imgDiv.childNodes.forEach(function (child) {
                                                    var input = document.createElement(child.getAttribute("quick-t-tag"));
                                                    if (child.getAttribute("quick-t-type")) {
                                                        input.setAttribute("quick-t-type", child.getAttribute("quick-t-type"));
                                                    }
                                                    input.setAttribute("quick-t-tag", child.getAttribute("quick-t-tag"));
                                                    inputs.push(input);
                                                    child.childNodes.forEach(function (subChild) {
                                                        var childType = "";
                                                        if (child.getAttribute("quick-t-type")) {
                                                            childType = "quick-t-type=\"" + child.getAttribute("quick-t-type") + "\"";
                                                        }

                                                        var part = "<" + child.localName + " quickt-sort=\"" + i + "\" " + childType + " quick-t-tag=\"" + child.getAttribute("quick-t-tag") + "\">" + (subChild.outerHTML || subChild.data) + "</" + child.localName + ">";
                                                        partsToTranslate.push(part);
                                                        i++;
                                                    });
                                                });

                                                var translatedParts = [];

                                                var settings = {
                                                    "async": true,
                                                    "crossDomain": true,
                                                    "url": "",
                                                    "method": "GET",
                                                    "headers": {},
                                                };

                                                var progressBar = quickTranslateProgressBar();


                                                for (var i = 0; i < partsToTranslate.length; i++) {
                                                    var url = createDeeplApiUrl(key, type, partsToTranslate[i], langs[0], langs[1]);
                                                    settings.url = url;

                                                    $.ajax(settings).done(function (response) {

                                                        translatedParts.push(response.translations[0].text);
                                                        progressBar[0].updateProgress(translatedParts.length / partsToTranslate.length, "Translating: " + translatedParts.length + " of " + partsToTranslate.length);

                                                    }).fail(function () {

                                                        translatedParts.push(null);
                                                        progressBar[0].updateProgress(translatedParts.length / partsToTranslate.length, "Translating: " + translatedParts.length + " of " + partsToTranslate.length);

                                                    });

                                                }

                                                var interval = setInterval(function () {
                                                    if (translatedParts.length === partsToTranslate.length) {

                                                        var translatedElements = "Translated elements: " + translatedParts.filter(function (part) {
                                                            return part != null;
                                                        }).length;

                                                        var notTranslatedElements = "Not translated elements: " + translatedParts.filter(function (part) {
                                                            return part == null;
                                                        }).length;

                                                        progressBar[1].destroy();

                                                        if (translatedElements > notTranslatedElements) {

                                                            var collator = new Intl.Collator(undefined, {
                                                                numeric: true,
                                                                sensitivity: "base"
                                                            });

                                                            translatedParts.sort(collator.compare);

                                                            var helper = document.createElement("div");

                                                            helper.innerHTML = translatedParts.map(function (part) {
                                                                return part.replace(/quickt-sort="[0-9]"*/, "");
                                                            }).join("");

                                                            inputs.forEach(function (input) {
                                                                helper.childNodes.forEach(function (child) {
                                                                    if (child.getAttribute("quick-t-tag") === input.getAttribute("quick-t-tag")) {
                                                                        input.innerHTML += child.innerHTML;
                                                                    }
                                                                })
                                                            });

                                                            var xml = inputs.map(function (input) {
                                                                return input.outerHTML;
                                                            }).join("");

                                                            helper.remove();

                                                            this.translateObject(this.element.id, langs[1], xmlToJson(xml, srcSet));

                                                        } else {
                                                            quickTranslatecreateWindow("Error", "We couldn't translate your document. Check your internet connection and that you haven't exceeded the maximum amount of translatable characters!");
                                                        }

                                                        clearInterval(interval);
                                                    }
                                                }.bind(this), 100);

                                            } else {

                                                xmlStr = imgDiv.innerHTML.toString();
                                                imgDiv.remove();

                                                xmlToJson(xmlStr);

                                                quickTranslate(key, type, xmlStr, srcSet, langs[0], langs[1], this.element.id, this.translateObject, quickTranslatecreateWindow);

                                            }

                                        } else {
                                            quickTranslatecreateWindow("Required fields", "Please choose both source and target languages!");
                                        }

                                    }.bind(this)).fail(function (response) {

                                        var status = response.status;

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
                                    quickTranslatecreateWindow("Missing authentication key", "Please insert your DeepL authentication key in the Pimcore website settings!");
                                }

                            }.bind(this),

                            failure: function () {
                                quickTranslatecreateWindow("Error", "We encountered an error while checking for your DeepL authentication key. Internal server error.");
                            }
                        });

                    }.bind(this)
                }
            });

            var layoutConf = {
                tabConfig: {
                    tooltip: 'Quick Translate'
                },
                id: 'quickTranslate-panel' + this.element.id,
                items: [panel],
                layout: "border",
                iconCls: 'quick-translate-icon pimcore_material_icon',
            };

            this.layout = new Ext.Panel(layoutConf);

        }

        return this.layout;


    },


    /* get all available languages configured in admin panel that are supported by deepl*/
    getLanguages: function () {


        var locales = pimcore.settings.websiteLanguages.filter(function (language) {
            return isDeeplLanguage(language);
        });

        var languages = [];

        for (var i = 0; i < locales.length; i++) {
            var langText = pimcore.available_languages[locales[i]] + " [" + locales[i] + "]";
            languages.push([locales[i], langText]);
        }
        ;

        return languages;

    },

    /* creates EXT JS arraystore for language comboboxes */
    getLangExtStore: function (data, fields) {
        return new Ext.data.ArrayStore({
            fields: fields,
            data: data
        });
    },

    /* return selected languages */
    getSelectedLangs: function (langFrom, langTo) {
        var langFrom = Ext.getCmp(langFrom).getValue();
        var langTo = Ext.getCmp(langTo).getValue();

        return [langFrom, langTo];
    },

    /* ajax request to controller for saving translations to db */
    translateObject: function (id, locale, data) {

        var settings = {
            url: "/asioso_quick_translate_object",
            method: 'POST',
            data: {
                id: id,
                locale: locale,
                data: data
            }
        };

        var savingWindow = quickTranslatecreateWindow("Saving", "Saving your translations!");

        $.ajax(settings).done(function (response) {

            savingWindow.destroy();
            if (response == "true") {
                quickTranslatecreateWindow("Success!", "Your text has been successfully translated and saved! Reload your object to see your translation.", true, id)
            } else {
                quickTranslatecreateWindow("Error!", "Something went wrong while saving your translation. Internal server error!")
            }
        }).fail(function () {
            savingWindow.destroy();
            quickTranslatecreateWindow("Error!", "Something went wrong while saving your translation. Internal server error!")
        });

    },


});