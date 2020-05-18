function isDeeplLanguage(lang) {

    lang = lang.split("_")[0];

    var deeplLanguages = [
        "en",
        "de",
        "fr",
        "es",
        "pt",
        "it",
        "nl",
        "pl",
        "ru",
    ];



    return deeplLanguages.includes(lang);
}