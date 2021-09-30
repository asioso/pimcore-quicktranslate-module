/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

pimcore.registerNS("pimcore.document.editables.areablock");
pimcore.document.editables.areablock = Class.create(pimcore.document.editables.areablock, {

    refreshControls: function (element, limitReached) {
        var plusButton, minusButton, upButton, downButton, optionsButton, plusDiv, minusDiv, upDiv, downDiv, optionsDiv,
            typeDiv, typeButton, labelText, visibilityDiv, labelDiv, plusUpDiv, plusUpButton,
            dialogBoxDiv, dialogBoxButton;

        // re-initialize controls on every refresh
        plusUpButton = Ext.get(element).query('.pimcore_block_plus_up[data-name="' + this.name + '"] .pimcore_block_button_plus', false)[0];
        if (typeof plusUpButton !== 'undefined') {
            plusUpButton.remove();
        }

        plusButton = Ext.get(element).query('.pimcore_block_plus[data-name="' + this.name + '"] .pimcore_block_button_plus', false)[0];
        if (typeof plusButton !== 'undefined') {
            plusButton.remove();
        }

        if(!limitReached) {
            // plus buttons
            plusUpDiv = Ext.get(element).query('.pimcore_block_plus_up[data-name="' + this.name + '"]')[0];
            plusUpButton = new Ext.Button({
                cls: "pimcore_block_button_plus",
                iconCls: "pimcore_icon_plus_up",
                arrowVisible: false,
                menu: this.getTypeMenu(this, element, "before")
            });
            plusUpButton.render(plusUpDiv);

            plusDiv = Ext.get(element).query('.pimcore_block_plus[data-name="' + this.name + '"]')[0];
            plusButton = new Ext.Button({
                cls: "pimcore_block_button_plus",
                iconCls: "pimcore_icon_plus_down",
                arrowVisible: false,
                menu: this.getTypeMenu(this, element, "after")
            });
            plusButton.render(plusDiv);
        }

        // minus button
        minusButton = Ext.get(element).query('.pimcore_block_minus[data-name="' + this.name + '"] .pimcore_block_button_minus')[0];
        if (typeof minusButton === 'undefined') {
            minusDiv = Ext.get(element).query('.pimcore_block_minus[data-name="' + this.name + '"]')[0];
            minusButton = new Ext.Button({
                cls: "pimcore_block_button_minus",
                iconCls: "pimcore_icon_minus",
                listeners: {
                    "click": this.removeBlock.bind(this, element)
                }
            });
            minusButton.render(minusDiv);
        }

        // up button
        upButton = Ext.get(element).query('.pimcore_block_up[data-name="' + this.name + '"] .pimcore_block_button_up')[0];
        if (typeof upButton === 'undefined') {
            upDiv = Ext.get(element).query('.pimcore_block_up[data-name="' + this.name + '"]')[0];
            upButton = new Ext.Button({
                cls: "pimcore_block_button_up",
                iconCls: "pimcore_icon_white_up",
                listeners: {
                    "click": this.moveBlockUp.bind(this, element)
                }
            });
            upButton.render(upDiv);
        }

        // down button
        downButton = Ext.get(element).query('.pimcore_block_down[data-name="' + this.name + '"] .pimcore_block_button_down')[0];
        if (typeof downButton === 'undefined') {
            downDiv = Ext.get(element).query('.pimcore_block_down[data-name="' + this.name + '"]')[0];
            downButton = new Ext.Button({
                cls: "pimcore_block_button_down",
                iconCls: "pimcore_icon_white_down",
                listeners: {
                    "click": this.moveBlockDown.bind(this, element)
                }
            });
            downButton.render(downDiv);
        }

        // type button
        typeButton = Ext.get(element).query('.pimcore_block_type[data-name="' + this.name + '"] .pimcore_block_button_type')[0];
        if (typeof typeButton === 'undefined') {
            typeDiv = Ext.get(element).query('.pimcore_block_type[data-name="' + this.name + '"]')[0];
            typeButton = new Ext.Button({
                cls: "pimcore_block_button_type",
                handleMouseEvents: false,
                tooltip: t("drag_me"),
                iconCls: "pimcore_icon_white_move",
                style: "cursor: move;"
            });
            typeButton.on("afterrender", function (element, v) {
                v.dragZone = new Ext.dd.DragZone(v.getEl(), {
                    hasOuterHandles: true,
                    getDragData: function(e) {
                        var sourceEl = element;

                        // only use the button as proxy element
                        proxyEl = v.getEl().dom;

                        if (sourceEl) {
                            var d = proxyEl.cloneNode(true);
                            d.id = Ext.id();

                            return v.dragData = {
                                sourceEl: sourceEl,
                                repairXY: Ext.fly(sourceEl).getXY(),
                                ddel: d
                            };
                        }
                    },

                    onStartDrag: this.startDragDrop.bind(this),
                    afterDragDrop: this.endDragDrop.bind(this),
                    afterInvalidDrop: this.endDragDrop.bind(this),
                    beforeDragOut: function (target) {
                        return target ? true : false;
                    },
                    getRepairXY: function() {
                        return this.dragData.repairXY;
                    }
                });
            }.bind(this, element));
            typeButton.render(typeDiv);
        }


        // option button
        optionsButton = Ext.get(element).query('.pimcore_block_options[data-name="' + this.name + '"] .pimcore_block_button_options')[0];
        if (typeof optionsButton === 'undefined') {
            optionsDiv = Ext.get(element).query('.pimcore_block_options[data-name="' + this.name + '"]')[0];
            optionsButton = new Ext.Button({
                cls: "pimcore_block_button_options",
                iconCls: "pimcore_icon_white_copy",
                listeners: {
                    "click": this.optionsClickhandler.bind(this, element)
                }
            });
            optionsButton.render(optionsDiv);
        }


        //visibility buttons
        visibilityButtons = this.visibilityButtons[element.key];
        if (typeof visibilityButtons === 'undefined') {
            visibilityDiv = Ext.get(element).query('.pimcore_block_visibility[data-name="' + this.name + '"]')[0];
            this.visibilityButtons[element.key] = new Ext.Button({
                cls: "pimcore_block_button_visibility",
                iconCls: "pimcore_icon_white_hide",
                enableToggle: true,
                pressed: (element.dataset.hidden == "true"),
                toggleHandler: function (element, el) {
                    Ext.get(element).toggleCls('pimcore_area_hidden');
                }.bind(this, element)
            });
            this.visibilityButtons[element.key].render(visibilityDiv);
            if(element.dataset.hidden == "true") {
                Ext.get(element).addCls('pimcore_area_hidden');
            }
        }


        //dialogBox button
        dialogBoxDiv = Ext.get(element).query('.pimcore_block_dialog[data-name="' + this.name + '"]')[0];
        if (dialogBoxDiv) {
            dialogBoxButton = Ext.get(element).query('.pimcore_block_dialog[data-name="' + this.name + '"] .pimcore_block_button_dialog')[0];
            if (typeof dialogBoxButton === 'undefined') {
                dialogBoxDiv = Ext.get(element).query('.pimcore_block_dialog[data-name="' + this.name + '"]')[0];
                dialogBoxButton = new Ext.Button({
                    cls: "pimcore_block_button_dialog",
                    iconCls: "pimcore_icon_white_edit",
                    listeners: {
                        "click": this.openEditableDialogBox.bind(this, element, dialogBoxDiv)
                    }
                });
                dialogBoxButton.render(dialogBoxDiv);
            }
        }

        /* add quicktranslate btn */
        var quickTranslateButton = new Ext.Button({
            iconCls: 'quick-translate-icon',
            scale: 'small',
            handler: function (i) {
                var brickName = this.name + ":" + element.key + ".";
                var documentId = pimcore_document_id;

                Ext.Ajax.request({
                    url: "/asioso_quick_translate_get_auth_key",
                    success: function (response) {
                        var authKey = Ext.decode(response.responseText);

                        if (authKey.exists) {

                            var key = authKey.authKey;

                            var checkerUrl = createDeeplApiUrl(key, "", "DE", "EN");

                            /* settings for checker request to deepl */
                            var checkerSettings = {
                                "async": true,
                                "crossDomain": true,
                                "url": checkerUrl,
                                "method": "GET",
                                "headers": {},
                            };
                            $.ajax(checkerSettings).done(function () {

                                var elementsWindow = quickTranslatecreateWindow("Processing", "Getting your content ready for translation...");
                            
                                Ext.Ajax.request({
                                    url: "/asioso_quick_translate_get_document_elements",
                                    method: 'GET',
                                    params: {
                                        id: documentId,
                                        isBrick: true,
                                        brickName: brickName
                                    },

                                    success: function (response) {
                                        var data = JSON.parse(response.responseText);

                                        if (isDeeplLanguage(data.langTo)) {
                                            if (data.elements != null) {

                                                var xml = "";

                                                Object.keys(data.elements).forEach(function (key) {
                                                    xml += '<' + key + ' quick-t-tag="' + key + '"  quick-t-type="' + data.elements[key]["type"] + '">' + data.elements[key]["data"] + '</' + key + '>';
                                                });


                                                xml = xmlRegReplace(xml);

                                                var tempWrapper = document.createElement("tempWrapper");

                                                tempWrapper.innerHTML = xml;

                                                var srcSet = [];
                                                Array.from(tempWrapper.getElementsByTagName("img")).forEach(function (image) {
                                                    srcSet.push(image.src);
                                                    image.src = "";
                                                });

                                                var langTo = data.langTo;

                                                var settings = {
                                                    "async": true,
                                                    "crossDomain": true,
                                                    "url": "",
                                                    "method": "GET",
                                                    "headers": {},
                                                };

                                                xml = tempWrapper.innerHTML.toString();

                                                /* if request is to large, divides it into more requests */
                                                if (xml.length > 4500) {

                                                    var partsToTranslate = [];

                                                    var i = 0;
                                                    var inputs = [];

                                                    tempWrapper.childNodes.forEach(function (child) {
                                                        var input = document.createElement(child.getAttribute("quick-t-tag"));

                                                        input.setAttribute("quick-t-type", child.getAttribute("quick-t-type"));
                                                        input.setAttribute("quick-t-tag", child.getAttribute("quick-t-tag"));

                                                        inputs.push(input);

                                                        child.childNodes.forEach(function (subChild) {
                                                            var part = "<" + child.localName + " quickt-sort=\"" + i + "\" quick-t-tag=\"" + child.getAttribute("quick-t-tag") + "\">" + (subChild.outerHTML || subChild.data) + "</" + child.localName + ">";
                                                            partsToTranslate.push(part);
                                                            i++;
                                                        });
                                                    });

                                                    var translatedParts = [];

                                                    elementsWindow.destroy();

                                                    var progressBar = quickTranslateProgressBar();

                                                    for (var i = 0; i < partsToTranslate.length; i++) {
                                                        var url = createDeeplApiUrl(key, partsToTranslate[i], null, langTo, true);
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

                                                                elems = xmlToJson(xml, srcSet, true);

                                                                progressBar[0].text = "";
                                                                progressBar[0].updateProgress(100, "Saving");

                                                                Ext.Ajax.request({
                                                                    url: "/asioso_quick_translate_brick",
                                                                    method: 'POST',
                                                                    params: {
                                                                        id: documentId,
                                                                        elements: elems
                                                                    },

                                                                    success: function () {
                                                                        progressBar[1].destroy();

                                                                        var window = new Ext.window.Window({
                                                                            minHeight: 150,
                                                                            minWidth: 350,
                                                                            maxWidth: 700,
                                                                            modal: true,
                                                                            layout: 'fit',
                                                                            bodyStyle: "padding: 10px;",
                                                                            title: "Success",
                                                                            html: "Yor brick was successfully translated and saved. To see your changes click reload!",
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Reload',
                                                                                    handler: function () {
                                                                                        reloadDocument(documentId, data.type);
                                                                                    }
                                                                                }
                                                                            ]
                                                                        });

                                                                        window.show();

                                                                        if (translatedParts.includes(null)) {
                                                                            window.html = "Your brick was successfully saved, but we couldn't translate all the elements!<br><br>" + translatedElements + "<br>" + notTranslatedElements + "<br><br>To see your changes click reload!";
                                                                        } else {
                                                                            window.html = "Your brick was successfully translated and saved! To see your changes click reload!" ;
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

                                                    var url = createDeeplApiUrl(key, xml, null, langTo, true);
                                                    settings.url = url;

                                                    function deeplAjax(settings) {

                                                        elementsWindow.destroy();

                                                        var translatingWindow = quickTranslatecreateWindow("Translating", "Translating your brick...");

                                                        $.ajax(settings).done(function (response) {
                                                            elems = xmlToJson(response.translations[0].text, srcSet, true);

                                                            translatingWindow.destroy();

                                                            var savingWindow = quickTranslatecreateWindow("Saving", "Saving your translated brick...");

                                                            Ext.Ajax.request({
                                                                url: "/asioso_quick_translate_brick",
                                                                method: 'POST',
                                                                params: {
                                                                    id: documentId,
                                                                    elements: elems
                                                                },
                                                                success: function () {

                                                                    savingWindow.destroy();

                                                                    var window = new Ext.window.Window({
                                                                        minHeight: 150,
                                                                        minWidth: 350,
                                                                        maxWidth: 700,
                                                                        modal: true,
                                                                        layout: 'fit',
                                                                        bodyStyle: "padding: 10px;",
                                                                        title: "Success",
                                                                        html: "Yor brick was successfully translated and saved. To see your changes click reload!",
                                                                        buttons: [
                                                                            {
                                                                                text: 'Reload',
                                                                                handler: function () {
                                                                                    reloadDocument(documentId, data.type);
                                                                                }
                                                                            }
                                                                        ]
                                                                    });

                                                                    window.show();

                                                                }.bind(this),

                                                                failure: function () {
                                                                    savingWindow.destroy();
                                                                    quickTranslatecreateWindow("Error", "We encountered an error while saving your translated brick. Internal server error.");
                                                                }
                                                            });

                                                        }).fail(function () {
                                                            translatingWindow.destroy();
                                                            quickTranslatecreateWindow("Error", "We couldn't translate your brick. Either the brick is too large or you have a malformed structure!");
                                                        });
                                                    };

                                                    deeplAjax(settings);
                                                }

                                                tempWrapper.remove();

                                            } else {
                                                elementsWindow.destroy();
                                                quickTranslatecreateWindow("Empty brick", "We couldn't translate your brick beacuse it is empty!");
                                            }
                                        } else {
                                            elementsWindow.destroy();
                                            quickTranslatecreateWindow("Unsuported language", "We couldn't translate your brick beacuse it is in a language not supported by DeepL!");
                                        }

                                    },

                                    failure: function () {
                                        elementsWindow.destroy();
                                        quickTranslatecreateWindow("Error", "We encountered an error while processing your content for translation. Internal server error.");
                                    }

                                });

                            }).fail(function () {

                                var status = response.status;

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
                            quickTranslatecreateWindow("Missing authentication key", "Please insert your DeepL authentication key in the Pimcore website settings!");
                        }
                    },

                    failure: function () {
                        quickTranslatecreateWindow("Connection error", "We encountered an error while checking for your DeepL authentication key. Internal server error.");
                    }
                });


            }.bind(this, element)
        });
        quickTranslateButton.render(visibilityDiv);

        labelDiv = Ext.get(Ext.get(element).query('.pimcore_block_label[data-name="' + this.name + '"]')[0]);
        labelText = "<b>"  + element.type + "</b>";
        if(this.typeNameMappings[element.type]
            && typeof this.typeNameMappings[element.type].name != "undefined") {
            labelText = "<b>" + this.typeNameMappings[element.type].name + "</b> "
                + this.typeNameMappings[element.type].description;
        }
        labelDiv.setHtml(labelText);
    },

});
