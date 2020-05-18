<?php

namespace asioso\QuickTranslateBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class quickTranslateBundle extends AbstractPimcoreBundle
{
    public function getJsPaths()
    {
        return [
            '/bundles/asiosoquicktranslate/js/pimcore/startup.js',
            '/bundles/asiosoquicktranslate/js/quick-translate-btn/quickTranslateObjectBtn.js',
            '/bundles/asiosoquicktranslate/js/quick-translate-btn/quickTranslateDocument.js',
            '/bundles/asiosoquicktranslate/js/quick-translate-api/quickTranslate.js',
            '/bundles/asiosoquicktranslate/js/utilities/xml2json.js',
            '/bundles/asiosoquicktranslate/js/utilities/quickTranslateWindow.js',
            '/bundles/asiosoquicktranslate/js/utilities/xmlRegReplace.js',
            '/bundles/asiosoquicktranslate/js/utilities/progressBar.js',
            '/bundles/asiosoquicktranslate/js/utilities/createDeeplApiUrl.js',
            '/bundles/asiosoquicktranslate/js/utilities/isDeeplLanguage.js',
            '/bundles/asiosoquicktranslate/js/utilities/reloadDocument.js',
        ];
    }

    public function getEditmodeJsPaths()
    {

        return [
            '/bundles/asiosoquicktranslate/js/quick-translate-btn/areablock.js',
            '/bundles/asiosoquicktranslate/js/utilities/xml2json.js',
            '/bundles/asiosoquicktranslate/js/utilities/quickTranslateWindow.js',
            '/bundles/asiosoquicktranslate/js/utilities/xmlRegReplace.js',
            '/bundles/asiosoquicktranslate/js/utilities/progressBar.js',
            '/bundles/asiosoquicktranslate/js/utilities/createDeeplApiUrl.js',
            '/bundles/asiosoquicktranslate/js/utilities/reloadDocument.js',
            '/bundles/asiosoquicktranslate/js/utilities/isDeeplLanguage.js',
        ];

    }

    public function getEditmodeCssPaths()
    {
        return [
            '/bundles/asiosoquicktranslate/css/quick-translate.css'
        ];
    }

    public function getCssPaths()
    {
        return [
            '/bundles/asiosoquicktranslate/css/quick-translate.css'
        ];
    }
}
