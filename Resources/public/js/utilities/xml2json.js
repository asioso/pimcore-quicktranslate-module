/* converts xml translation to json */
function xmlToJson(xml, srcSet = null, isDocument = false) {
    var translation = xmlRegReplace(xml, true);
    var div = document.createElement('temporaryWrapper');

    div.innerHTML = translation;

    if (srcSet != null) {
        Array.from(div.getElementsByTagName("img")).forEach(function (image, key) {
            image.src = srcSet[key];
        }, srcSet);
    }

    var dataToSave = {};

    if (isDocument) {
        div.childNodes.forEach(function (child) {
            dataToSave[child.getAttribute("quick-t-tag")] = {
                "type": child.getAttribute("quick-t-type"),
                "data": child.innerHTML
            }
        });
    } else {
        div.childNodes.forEach(function (child) {
            if (child.getAttribute("quick-t-type")) {

                dataToSave[child.getAttribute("quick-t-tag")] = child.innerHTML.split("|").map(function (row) {
                    return row.split(",").map(function (cell) {
                        return (cell == " " ? "" : cell);
                    });
                });;

            } else {
                dataToSave[child.getAttribute("quick-t-tag")] = child.innerHTML;
            }
        });
    }

    div.remove();

    return JSON.stringify(dataToSave);
};
