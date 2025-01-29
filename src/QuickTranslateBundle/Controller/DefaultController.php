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
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends FrontendController
{
    private $authKey;

    private $type;

    private $domain;

    public function __construct()
    {
        $this->authKey = WebsiteSetting::getByName("deepl_auth_key") ? WebsiteSetting::getByName("deepl_auth_key")->getData() : null;
        $this->type = WebsiteSetting::getByName("deepl_type") ? WebsiteSetting::getByName("deepl_type")->getData() : null;
        if ($this->type == 'PRO') {
            $this->domain = 'https://api.deepl.com';
        } else {
            $this->domain = 'https://api-free.deepl.com';
        }
    }

    /* used to check if deepl authentication key exists */
    public function getAuthKeyAction()
    {
        return new JsonResponse([
            "authKey" => $this->authKey,
            "exists" => (($this->authKey == null || "") ? false : true),
            "type" => $this->type,
            "type_exists" => (($this->type == null || "") ? false : true),
        ]);
    }

    public function getGlossariesAction()
    {
        $glossaries = null;

        if ($this->authKey) {
            $headers = [
                'Authorization' => 'DeepL-Auth-Key ' . $this->authKey,
            ];

            $client = new Client([
                'headers' => $headers
            ]);


            $response = $client->request('GET', $this->domain . '/v2/glossaries');

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

    public function translate(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        $url = $this->domain . '/v2/translate';

        $body = [
            'text' => [$payload['text']] ?? [],
            'target_lang' => $payload['target_lang'] ?? null,
            'source_lang' => $payload['source_lang'] ?? null,
            'split_sentences' => $payload['split_sentences'] ?? 'nonewlines',
            'tag_handling' => $payload['tag_handling'] ?? 'xml',
            'glossary_id' => $payload['glossary_id'] ?? null,
        ];

        try {
            $client = new Client();

            $response = $client->request('POST', $url, [
                'headers' => [
                    'Authorization' => 'DeepL-Auth-Key ' . $this->authKey,
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode($body),
            ]);
            if ($response->getStatusCode() == 200) {
                $data = $response->getBody()->getContents();

                return new JsonResponse(json_decode($data, true));
            } else {

            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Capture 4xx errors (e.g., bad request)
            $errorResponse = $e->getResponse();
            $errorData = $errorResponse
                ? json_decode($errorResponse->getBody()->getContents(), true)
                : ['error' => 'Unknown client error occurred.'];
            return new JsonResponse($errorData, $errorResponse->getStatusCode());
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
