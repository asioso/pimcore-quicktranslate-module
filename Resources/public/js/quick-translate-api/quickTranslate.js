function quickTranslate(key, data,srcSet = null,langFrom, langTo, id,successCallback, failCallback) {

    var url = createDeeplApiUrl(key, data, langFrom, langTo);

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",
        "headers": {},
    };

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