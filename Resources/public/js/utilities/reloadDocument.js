function reloadDocument(documentId, type) {
    pimcore.helpers.closeDocument(documentId);
    pimcore.helpers.openDocument(documentId, type);
}