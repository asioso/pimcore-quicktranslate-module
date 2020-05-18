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
        .replace(/&nbsp;/g, "(AmPnBsP);")
        .replace(/<br( \/)?>/g, "(br)")
        .replace(/&amp;/g, "AmP;")
        .replace(/ & /g, "AmP;")
        .replace(/#/g, "(HaShTaG)");
};