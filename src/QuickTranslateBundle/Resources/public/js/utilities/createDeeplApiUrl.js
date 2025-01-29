/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

/* returns url for ajax request on deepls api */
function createDeeplApiUrl(key, type, data, langFrom = null, langTo, autoDetect = false) {

    if (langFrom) {
        langFrom = langFrom.split("_")[0];
        langFrom = langFrom.toUpperCase();
    }

    langTo = langTo.split("_")[0];
    langTo = langTo.toUpperCase();

    if (type == "PRO") {
        url = 'https://api.deepl.com';
    } else {
        url = 'https://api-free.deepl.com';
    }

    var glossaryId = null;

    Ext.Ajax.request({
        url: "/asioso_quick_translate_get_glossaries",
        async: false,
        success: function (response) {
            var data = Ext.decode(response.responseText);
            var glossaries = data.glossaries;


            if(glossaries) {
                var glossariesFiltered = glossaries.filter((glossary) => {
                    return (glossary.source_lang.toUpperCase() === langFrom && glossary.target_lang.toUpperCase() === langTo)
                });

                if(glossariesFiltered && glossariesFiltered[0] !== undefined) {
                    glossaryId = glossariesFiltered[0].glossary_id;
                }
            }
        },
        failure: function () {
            quickTranslatecreateWindow("Connection error", "We encountered an error while getting the glossaries. Internal server error.");
        }
    });

    var glossaryPart = '';
    if(glossaryId) {
        glossaryPart = '&glossary_id=' + glossaryId;
    }
    data = encodeURIComponent(data)

    if (autoDetect) {
        return url + '/v2/translate?auth_key=' + key + '&text=' + data + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml' + glossaryPart;
    }

    return url + '/v2/translate?auth_key=' + key + '&text=' + data + '&source_lang=' + langFrom + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml' + glossaryPart;

};

function createDeeplApiSettings(data, langFrom = null, langTo, autoDetect = false) {

    if (langFrom) {
        langFrom = langFrom.split("_")[0];
        langFrom = langFrom.toUpperCase();
    }

    langTo = langTo.split("_")[0];
    langTo = langTo.toUpperCase();

    var glossaryId = null;

    Ext.Ajax.request({
        url: "/asioso_quick_translate_get_glossaries",
        async: false,
        success: function (response) {
            var data = Ext.decode(response.responseText);
            var glossaries = data.glossaries;


            if(glossaries) {
                var glossariesFiltered = glossaries.filter((glossary) => {
                    return (glossary.source_lang.toUpperCase() === langFrom && glossary.target_lang.toUpperCase() === langTo)
                });

                if(glossariesFiltered && glossariesFiltered[0] !== undefined) {
                    glossaryId = glossariesFiltered[0].glossary_id;
                }
            }
        },
        failure: function () {
            quickTranslatecreateWindow("Connection error", "We encountered an error while getting the glossaries. Internal server error.");
        }
    });

    const body = {
        text: data,
        target_lang: langTo,
    };

    if (langFrom && !autoDetect) {
        body.source_lang = langFrom;
    }

    if (glossaryId) {
        body.glossary_id = glossaryId;
    }

    var settings = {
        "async": true,
        "url": '/asioso_quick_translate_text',
        "method": "POST",
        "headers": {
            "Content-Type": "application/json" // Updated to JSON format
        },
        "data": JSON.stringify(body)
    };

    return settings;
};