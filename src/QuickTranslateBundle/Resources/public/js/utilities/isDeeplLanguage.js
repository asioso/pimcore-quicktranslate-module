/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

function isDeeplLanguage(lang) {
    if (!lang) {
        return false;
    }

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
        "ja",
        "zh",
        // new languages
        "bg",
        "cs",
        "da",
        "el",
        "et",
        "fi",
        "hu",
        "lt",
        "lv",
        "ro",
        "sk",
        "sl",
        "sv",
        // again new languages
        "id",
        "ko",
        "nb",
        "tr",
        "ua"
    ];

    return deeplLanguages.includes(lang);
}