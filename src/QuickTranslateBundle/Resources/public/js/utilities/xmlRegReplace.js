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
            .replace(/\(HaShTaG\)/g, "#")
            .replace(/\(gT\)/g, ">")
            .replace(/\(lT\)/g, "<")
            .replace(/\(sC\)/g, ";");
    }

    return xml.replace(/\s\s+/g, "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/&nbsp;/g, "(AmPnBsP);")
        .replace(/<br( \/)?>/g, "(br)")
        .replace(/&amp;/g, "AmP;")
        .replace(/ & /g, "AmP;")
        .replace(/#/g, "(HaShTaG)")
        .replace(/;/g, "(sC)");
};