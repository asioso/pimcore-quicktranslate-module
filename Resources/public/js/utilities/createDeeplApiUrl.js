/* returns url for ajax request on deepls api */
function createDeeplApiUrl(key, data, langFrom = null, langTo, autoDetect = false) {

    if (langFrom) {
        langFrom = langFrom.split("_")[0];
        langFrom = langFrom.toUpperCase();
    }

    langTo = langTo.split("_")[0];
    langTo = langTo.toUpperCase();

    if (autoDetect) {
        return 'https://api.deepl.com/v2/translate?auth_key=' + key + '&text=' + data + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml';
    }
    return 'https://api.deepl.com/v2/translate?auth_key=' + key + '&text=' + data + '&source_lang=' + langFrom + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml';

};