<?php
/**
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

namespace Asioso\QuickTranslateBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Pimcore\Model\WebsiteSetting;

class DefaultController extends FrontendController
{

    /* used to check if deepl authentication key exists */
    public function getAuthKeyAction()
    {
        $authKey = WebsiteSetting::getByName("deepl_auth_key") ? WebsiteSetting::getByName("deepl_auth_key")->getData() : null;

        return JsonResponse::create([
                "authKey" => $authKey,
                "exists" => (($authKey == null || "") ? false : true),
        ]);
    }
}
