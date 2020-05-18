<?php

namespace asioso\QuickTranslateBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Pimcore\Model\WebsiteSetting;

class DefaultController extends FrontendController
{

    /* used to check if deepl authentication key exists */
    public function getAuthKeyAction()
    {
        $authKey = WebsiteSetting::getByName("deepl_auth_key") ? WebsiteSetting::getByName("deepl_auth_key")->getData() : null;

        JsonResponse::create([
                "authKey" => $authKey,
                "exists" => (($authKey == null || "") ? false : true),
        ])->send();

    }
}
