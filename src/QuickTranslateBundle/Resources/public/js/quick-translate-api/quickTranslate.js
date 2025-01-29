/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

function quickTranslate(data,srcSet = null,langFrom, langTo, id,successCallback, failCallback) {

    var settings = createDeeplApiSettings(data, langFrom, langTo);

    var translatingWindow = quickTranslatecreateWindow("Translating", "Translating your content, please wait...");

    $.ajax(settings).done(function (response) {

        translatingWindow.destroy();
        var translatedData = xmlToJson(response.translations[0].text, srcSet);
        successCallback(id, langTo, translatedData);

    }).fail(function () {
        translatingWindow.destroy();
        failCallback("Failed", "There was a problem connecting to the DeepL translations service! Check your internet connection and that you haven't exceeded the maximum amount of translatable characters!");
    });

};