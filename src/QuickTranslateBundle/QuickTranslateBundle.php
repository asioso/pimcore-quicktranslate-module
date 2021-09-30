<?php
/**
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

namespace Asioso\QuickTranslateBundle;

use PackageVersions\Versions;
use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\PimcoreBundleInterface;
use Pimcore\Extension\Bundle\Traits\PackageVersionTrait;

class QuickTranslateBundle extends AbstractPimcoreBundle implements PimcoreBundleInterface
{

    use PackageVersionTrait;
    const PACKAGE_NAME = 'asioso/pimcore-quicktranslate-module';

    public function getJsPaths()
    {
        return [
            'https://code.jquery.com/jquery-3.6.0.min.js',
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


    public static function getSolutionVersion(){
        //code duplication from PackageVersionTrait... sorry
        $version = Versions::getVersion(self::PACKAGE_NAME);

        // normalizes v2.3.0@9e016f4898c464f5c895c17993416c551f1697d3 to 2.3.0
        $version = preg_replace('/^v/', '', $version);
        $version = preg_replace('/@(.+)$/', '', $version);

        return $version;
    }

    /**
     * Returns the composer package name used to resolve the version
     *
     * @return string
     */
    protected function getComposerPackageName(): string
    {
        return self::PACKAGE_NAME;
    }
}
