<?php
/**
 * This source file is available under  GNU General Public License version 3 (GPLv3)
 *
 * Full copyright and license information is available in LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) Asioso GmbH (https://www.asioso.com)
 *
 */

namespace Asioso\QuickTranslateBundle\Controller;

use GuzzleHttp\Client;
use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Pimcore\Model\WebsiteSetting;

class DefaultController extends FrontendController
{

    /* used to check if deepl authentication key exists */
    public function getAuthKeyAction()
    {
        $authKey = WebsiteSetting::getByName("deepl_auth_key") ? WebsiteSetting::getByName("deepl_auth_key")->getData() : null;
        $type = WebsiteSetting::getByName("deepl_type") ? WebsiteSetting::getByName("deepl_type")->getData() : null;

        return new JsonResponse([
            "authKey" => $authKey,
            "exists" => (($authKey == null || "") ? false : true),
            "type" => $type,
            "type_exists" => (($type == null || "") ? false : true),
        ]);
    }

    public function getGlossariesAction()
    {
        $authKey = WebsiteSetting::getByName("deepl_auth_key") ? WebsiteSetting::getByName("deepl_auth_key")->getData() : null;
        $type = WebsiteSetting::getByName("deepl_type") ? WebsiteSetting::getByName("deepl_type")->getData() : null;

        $glossaries = null;

        if ($authKey) {
            $headers = [
                'Authorization' => 'DeepL-Auth-Key ' . $authKey,
            ];

            $client = new Client([
                'headers' => $headers
            ]);

            if ($type == 'PRO') {
                $response = $client->request('GET', 'https://api.deepl.com/v2/glossaries');
            } else {
                $response = $client->request('GET', 'https://api-free.deepl.com/v2/glossaries');
            }

            if ($response->getStatusCode() == 200) {

                $resultDecoded = json_decode($response->getBody()->getContents(), true);

                if (isset($resultDecoded['glossaries'])) {
                    $glossaries = $resultDecoded['glossaries'];
                }

            }

        }

        return new JsonResponse([
            "glossaries" => $glossaries
        ]);
    }


}
