<?php
/**
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

namespace AsiosoQuickTranslateBundle;

use PackageVersions\Versions;
use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\PimcoreBundleInterface;
use Pimcore\Extension\Bundle\Traits\PackageVersionTrait;

class AsiosoQuickTranslateBundle extends AbstractPimcoreBundle implements PimcoreBundleInterface
{

    use PackageVersionTrait;
    const PACKAGE_NAME = 'asioso/pimcore-quicktranslate-module';

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
