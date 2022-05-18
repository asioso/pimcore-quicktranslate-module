/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

/* returns url for ajax request on deepls api */
function createDeeplApiUrl(key, data, langFrom = null, langTo, autoDetect = false) {

    if (langFrom) {
        langFrom = langFrom.split("_")[0];
        langFrom = langFrom.toUpperCase();
    }

    langTo = langTo.split("_")[0];
    langTo = langTo.toUpperCase();

    if (autoDetect) {
        return 'https://api-free.deepl.com/v2/translate?auth_key=' + key + '&text=' + data + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml';
    }
    return 'https://api-free.deepl.com/v2/translate?auth_key=' + key + '&text=' + data + '&source_lang=' + langFrom + '&target_lang=' + langTo + '&split_sentences=nonewlines&tag_handling=xml';

};