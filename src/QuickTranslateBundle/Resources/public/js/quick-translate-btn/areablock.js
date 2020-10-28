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

    namingStrategies: {},
    namingStrategy: null,
    dialogBoxes: {},

    initialize: function (id, name, config, data, inherited) {

        this.id = id;
        this.name = name;
        this.elements = [];
        this.brickTypeUsageCounter = [];
        this.config = this.parseConfig(config);

        this.initNamingStrategies();
        var namingStrategy = this.getNamingStrategy();

        this.toolbarGlobalVar = this.getType() + "toolbar";

        this.applyFallbackIcons();

        if (typeof this.config["toolbar"] == "undefined" || this.config["toolbar"] != false) {
            this.createToolBar();
        }

        this.visibilityButtons = {};

        var plusButton, minusButton, upButton, downButton, optionsButton, plusDiv, minusDiv, upDiv, downDiv, optionsDiv,
            typeDiv, typeButton, labelText, editDiv, editButton, visibilityDiv, labelDiv, plusUpDiv, plusUpButton,
            dialogBoxDiv, dialogBoxButton;

        this.elements = Ext.get(id).query('.pimcore_block_entry[data-name="' + name + '"][key]');

        // reload or not => default not
        if (typeof this.config["reload"] == "undefined") {
            this.config.reload = false;
        }

        if (!this.config['controlsTrigger']) {
            this.config['controlsTrigger'] = 'hover';
        }

        for (var i=0; i<data.length; i++) {
            this.brickTypeUsageCounter[data[i].type] = this.brickTypeUsageCounter[data[i].type]+1 || 1;
        }

        // type mapping
        var typeNameMappings = {};
        this.allowedTypes = []; // this is for the toolbar to check if an brick can be dropped to this areablock
        for (var i = 0; i < this.config.types.length; i++) {
            typeNameMappings[this.config.types[i].type] = {
                name: this.config.types[i].name,
                description: this.config.types[i].description,
                icon: this.config.types[i].icon
            };

            this.allowedTypes.push(this.config.types[i].type);
        }

        var limitReached = false;
        if (typeof config["limit"] != "undefined" && this.elements.length >= config.limit) {
            limitReached = true;
        }


        if (this.elements.length < 1) {
            this.createInitalControls();
        } else {
            var hideTimeout, activeBlockEl;

            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].key = this.elements[i].getAttribute("key");
                this.elements[i].type = this.elements[i].getAttribute("type");

                // edit button
                try {
                    editDiv = Ext.get(this.elements[i]).query('.pimcore_area_edit_button[data-name="' + this.name + '"]')[0];
                    if (editDiv) {
                        editButton = new Ext.Button({
                            cls: "pimcore_block_button_plus",
                            iconCls: "pimcore_icon_edit",
                            handler: this.editmodeOpen.bind(this, this.elements[i])
                        });
                        editButton.render(editDiv);
                    }
                } catch (e) {
                    console.log(e);
                }

                if (!limitReached) {
                    // plus buttons
                    plusUpDiv = Ext.get(this.elements[i]).query('.pimcore_block_plus_up[data-name="' + this.name + '"]')[0];
                    plusUpButton = new Ext.Button({
                        cls: "pimcore_block_button_plus",
                        iconCls: "pimcore_icon_plus_up",
                        arrowVisible: false,
                        menuAlign: "tr",
                        menu: this.getTypeMenu(this, this.elements[i], "before")
                    });
                    plusUpButton.render(plusUpDiv);

                    plusDiv = Ext.get(this.elements[i]).query('.pimcore_block_plus[data-name="' + this.name + '"]')[0];
                    plusButton = new Ext.Button({
                        cls: "pimcore_block_button_plus",
                        iconCls: "pimcore_icon_plus_down",
                        arrowVisible: false,
                        menuAlign: "tr",
                        menu: this.getTypeMenu(this, this.elements[i], "after")
                    });
                    plusButton.render(plusDiv);
                }

                // minus button
                minusDiv = Ext.get(this.elements[i]).query('.pimcore_block_minus[data-name="' + this.name + '"]')[0];
                minusButton = new Ext.Button({
                    cls: "pimcore_block_button_minus",
                    iconCls: "pimcore_icon_minus",
                    listeners: {
                        "click": this.removeBlock.bind(this, this.elements[i])
                    }
                });
                minusButton.render(minusDiv);

                // up button
                upDiv = Ext.get(this.elements[i]).query('.pimcore_block_up[data-name="' + this.name + '"]')[0];
                upButton = new Ext.Button({
                    cls: "pimcore_block_button_up",
                    iconCls: "pimcore_icon_white_up",
                    listeners: {
                        "click": this.moveBlockUp.bind(this, this.elements[i])
                    }
                });
                upButton.render(upDiv);

                // down button
                downDiv = Ext.get(this.elements[i]).query('.pimcore_block_down[data-name="' + this.name + '"]')[0];
                downButton = new Ext.Button({
                    cls: "pimcore_block_button_down",
                    iconCls: "pimcore_icon_white_down",
                    listeners: {
                        "click": this.moveBlockDown.bind(this, this.elements[i])
                    }
                });
                downButton.render(downDiv);

                typeDiv = Ext.get(this.elements[i]).query('.pimcore_block_type[data-name="' + this.name + '"]')[0];
                typeButton = new Ext.Button({
                    cls: "pimcore_block_button_type",
                    handleMouseEvents: false,
                    tooltip: t("drag_me"),
                    iconCls: "pimcore_icon_white_move",
                    style: "cursor: move;"
                });
                typeButton.on("afterrender", function (index, v) {

                    var element = this.elements[index];

                    v.dragZone = new Ext.dd.DragZone(v.getEl(), {
                        hasOuterHandles: true,
                        getDragData: function (e) {
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

                        onStartDrag: this.createDropZones.bind(this),
                        afterDragDrop: this.removeDropZones.bind(this),
                        afterInvalidDrop: this.removeDropZones.bind(this),

                        getRepairXY: function () {
                            return this.dragData.repairXY;
                        }
                    });
                }.bind(this, i));
                typeButton.render(typeDiv);


                // option button
                if (namingStrategy.supportsCopyPaste()) {
                    optionsDiv = Ext.get(this.elements[i]).query('.pimcore_block_options[data-name="' + this.name + '"]')[0];
                    optionsButton = new Ext.Button({
                        cls: "pimcore_block_button_options",
                        iconCls: "pimcore_icon_white_copy",
                        listeners: {
                            "click": this.optionsClickhandler.bind(this, this.elements[i])
                        }
                    });
                    optionsButton.render(optionsDiv);
                }

                visibilityDiv = Ext.get(this.elements[i]).query('.pimcore_block_visibility[data-name="' + this.name + '"]')[0];
                this.visibilityButtons[this.elements[i].key] = new Ext.Button({
                    cls: "pimcore_block_button_visibility",
                    iconCls: "pimcore_icon_white_hide",
                    enableToggle: true,
                    pressed: (this.elements[i].dataset.hidden == "true"),
                    toggleHandler: function (index, el) {
                        Ext.get(this.elements[index]).toggleCls('pimcore_area_hidden');
                    }.bind(this, i)
                });
                this.visibilityButtons[this.elements[i].key].render(visibilityDiv);
                if (this.elements[i].dataset.hidden == "true") {
                    Ext.get(this.elements[i]).addCls('pimcore_area_hidden');
                }

                /* add quicktranslate btn */
                var quickTranslateButton = new Ext.Button({
                    iconCls: 'quick-translate-icon',
                    scale: 'small',
                    handler: function (i) {
                        var brickName = name + ":" + data[i]["key"] + ".";
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


                    }.bind(this, i)
                });
                quickTranslateButton.render(visibilityDiv);

                labelDiv = Ext.get(Ext.get(this.elements[i]).query('.pimcore_block_label[data-name="' + this.name + '"]')[0]);
                labelText = "<b>" + this.elements[i].type + "</b>";
                if (typeNameMappings[this.elements[i].type]
                    && typeof typeNameMappings[this.elements[i].type].name != "undefined") {
                    labelText = "<b>" + typeNameMappings[this.elements[i].type].name + "</b> "
                        + typeNameMappings[this.elements[i].type].description;
                }
                labelDiv.setHtml(labelText);


                var buttonContainer = Ext.get(this.elements[i]).selectNode('.pimcore_area_buttons', false);
                if (this.config['controlsAlign']) {
                    buttonContainer.addCls(this.config['controlsAlign']);
                } else {
                    // top is default
                    buttonContainer.addCls('top');
                }

                buttonContainer.addCls(this.config['controlsTrigger']);

                if (this.config['controlsTrigger'] === 'hover') {
                    Ext.get(this.elements[i]).on('mouseenter', function (event) {

                        if (Ext.dd.DragDropMgr.dragCurrent) {
                            return;
                        }

                        if (hideTimeout) {
                            window.clearTimeout(hideTimeout);
                        }

                        Ext.get(id).query('.pimcore_area_buttons', false).forEach(function (el) {
                            if (event.target != el.dom) {
                                el.hide();
                            }
                        });

                        var buttonContainer = Ext.get(event.target).selectNode('.pimcore_area_buttons', false);
                        buttonContainer.show();

                        if (activeBlockEl != event.target) {
                            Ext.menu.Manager.hideAll();
                        }
                        activeBlockEl = event.target;
                    }.bind(this));

                    Ext.get(this.elements[i]).on('mouseleave', function (event) {
                        hideTimeout = window.setTimeout(function () {
                            Ext.get(event.target).selectNode('.pimcore_area_buttons', false).hide();
                            hideTimeout = null;
                        }, 10000);
                    });
                }
            }
        }

        // click outside, hide all block buttons
        if (this.config['controlsTrigger'] === 'hover') {
            Ext.getBody().on('click', function (event) {
                if (!Ext.get(id).isAncestor(event.target)) {
                    Ext.get(id).query('.pimcore_area_buttons', false).forEach(function (el) {
                        el.hide();
                    });
                }
            });
        }
    },


});
