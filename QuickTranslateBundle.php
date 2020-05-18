<?php
/**
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

namespace asioso\QuickTranslateBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\PimcoreBundleInterface;

class QuickTranslateBundle extends AbstractPimcoreBundle implements PimcoreBundleInterface
{
    public function getJsPaths()
    {
        return [
            '/bundles/quicktranslate/js/pimcore/startup.js',
            '/bundles/quicktranslate/js/quick-translate-btn/quickTranslateObjectBtn.js',
            '/bundles/quicktranslate/js/quick-translate-btn/quickTranslateDocument.js',
            '/bundles/quicktranslate/js/quick-translate-api/quickTranslate.js',
            '/bundles/quicktranslate/js/utilities/xml2json.js',
            '/bundles/quicktranslate/js/utilities/quickTranslateWindow.js',
            '/bundles/quicktranslate/js/utilities/xmlRegReplace.js',
            '/bundles/quicktranslate/js/utilities/progressBar.js',
            '/bundles/quicktranslate/js/utilities/createDeeplApiUrl.js',
            '/bundles/quicktranslate/js/utilities/isDeeplLanguage.js',
            '/bundles/quicktranslate/js/utilities/reloadDocument.js',
        ];
    }

    public function getEditmodeJsPaths()
    {

        return [
            '/bundles/quicktranslate/js/quick-translate-btn/areablock.js',
            '/bundles/quicktranslate/js/utilities/xml2json.js',
            '/bundles/quicktranslate/js/utilities/quickTranslateWindow.js',
            '/bundles/quicktranslate/js/utilities/xmlRegReplace.js',
            '/bundles/quicktranslate/js/utilities/progressBar.js',
            '/bundles/quicktranslate/js/utilities/createDeeplApiUrl.js',
            '/bundles/quicktranslate/js/utilities/reloadDocument.js',
            '/bundles/quicktranslate/js/utilities/isDeeplLanguage.js',
        ];

    }

    public function getEditmodeCssPaths()
    {
        return [
            '/bundles/quicktranslate/css/quick-translate.css'
        ];
    }

    public function getCssPaths()
    {
        return [
            '/bundles/quicktranslate/css/quick-translate.css'
        ];
    }


    public function getNiceName()
    {
        return 'Asioso - QuickTranslate Bundle';
    }

    /**
     * Bundle description as shown in extension manager
     *
     * @return string
     */
    public function getDescription()
    {
        return "";
    }

    public function getVersion()
    {
        return 'v1.0';
    }

    public static function getSolutionVersion()
    {
        return "v1.0";
    }
}
