/*
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

/* replaces text/html in the xml that would break the connection to deepls api */
function xmlRegReplace(xml, replaceBack = false) {
    if (replaceBack) {
        return xml.replace(/\(AmPnBsP\);/g, "&nbsp;")
            .replace(/\(br\)/g, '<br />')
            .replace(/AmP;/g, "&amp;")
            .replace(/\(HaShTaG\)/g, "#");
    }

    return xml.replace(/\s\s+/g, "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/<br( \/)?>/g, "(br)")
        .replace(/&amp;/g, "%26")
        .replace(/&/g, "%26")
        .replace(/#/g, "(HaShTaG)");
};