/* creates a window with a progress bar for multiple requests */
function quickTranslateProgressBar() {
    var progressBar = new Ext.ProgressBar({
        text: "Translating"
    });

    var progressWindow = new Ext.window.Window({
        minWidth: 550,
        modal: true,
        layout: 'fit',
        title: "Translating",
        items: [progressBar],
        bodyStyle: "padding: 10px;"
    });

    progressWindow.show();

    return[progressBar, progressWindow];

}