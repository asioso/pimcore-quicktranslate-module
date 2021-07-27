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
use Pimcore\Db;
use Pimcore\Logger;
use Pimcore\Model\Document;
use Pimcore\Tool;
use Pimcore\Tool\Authentication;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;


class DocumentController extends FrontendController
{


    /* checks if the document already exists */
    public function checkIfExistsAction(Request $request)
    {
        $parent = Document::getById($request->get("parentId"));
        $path = preg_replace('~/+~', '/', $parent->getRealFullPath() . "/" . $request->get("key"));

        if (Document\Service::pathExists($path)) {
            $exists = true;
        } else {
            $exists = false;
        }

        return JsonResponse::create([
            "exists" => $exists
        ]);

    }


    /* get all elements for the document */
    public function getDocumentElementsAction(Request $request)
    {

        $isBrick = $request->get("isBrick");
        $db = Db::get();

        $document = Document::getById($request->get("id"));

        if ($isBrick) {
            $id = $document->getContentMasterDocumentId() != null ? $document->getContentMasterDocumentId() : $document->getId();

            $brickName = $request->get("brickName");
            $elems = $db->fetchAll("SELECT name, type, data
                                        FROM documents_elements
                                        WHERE documentId=" . $document->getId() . " AND (type='input' OR type='textarea' OR type='wysiwyg') AND name LIKE '" . $brickName . "%'");

            if ($elems == null && $document->getContentMasterDocumentId() != null) {
                $elems = $db->fetchAll("SELECT name, type, data
                                        FROM documents_elements
                                        WHERE documentId=" . $document->getContentMasterDocumentId() . " AND (type='input' OR type='textarea' OR type='wysiwyg') AND name LIKE '" . $brickName . "%'");
            }

            $langTo = $document->getProperty("language");
            $type = $document->getType();

        } else {

            $elems = $db->fetchAll("SELECT name, type, data
                                        FROM documents_elements
                                        WHERE documentId=" . $request->get("id") . " AND (type='input' OR type='textarea' OR type='wysiwyg')");

            if ($elems == null && $document->getContentMasterDocumentId() != null) {
                $elems = $db->fetchAll("SELECT name, type, data
                                        FROM documents_elements
                                        WHERE documentId=" . $document->getContentMasterDocumentId() . " AND (type='input' OR type='textarea' OR type='wysiwyg')");
            }
        }

        foreach ($elems as $element) {

            $elements[$element["name"]] = (object)[
                "type" => $element["type"],
                "data" => $element["data"]
            ];
        }

        return JsonResponse::create([
            "elements" => $elements,
            "langTo" => ($isBrick ? $langTo : null),
            "type" => ($isBrick ? $type : null)
        ]);
    }


    public function saveBrickAction(Request $request)
    {
        $elements = json_decode($request->get("elements"), true);
        $document = Document::getById($request->get("id"));

        $oldElements = $document->getElements();

        $document->setElements($oldElements);

        foreach ($elements as $key => $element) {

            $document->setRawElement($key, $element["type"], $element["data"]);
        }

        $document->save();

        return JsonResponse::create([
            "success" => true
        ]);

    }


    /* save the document */
    public function saveDocumentAction(Request $request)
    {
        $success = false;
        $errorMessage = '';

        $parentDocument = Document::getById(intval($request->get('parentId')));

        $intendedPath = $parentDocument->getRealFullPath() . '/' . $request->get('key');

        $loggedInUser = Authentication::authenticateSession();

        if (!Document\Service::pathExists($intendedPath)) {
            $createValues = [
                'userOwner' => $loggedInUser->getId(),
                'userModification' => $loggedInUser->getId(),
                'published' => false
            ];

            $createValues['key'] = \Pimcore\Model\Element\Service::getValidKey($request->get('key'), 'document');

            // check for a docType
            $docType = Document\DocType::getById(intval($request->get('docTypeId')));
            if ($docType) {
                $createValues['template'] = $docType->getTemplate();
                $createValues['controller'] = $docType->getController();
                $createValues['legacy'] = $docType->getLegacy();
            } elseif ($request->get('translationsBaseDocument')) {
                $translationsBaseDocument = Document::getById($request->get('translationsBaseDocument'));
                $createValues['template'] = $translationsBaseDocument->getTemplate();
                $createValues['controller'] = $translationsBaseDocument->getController();
            } elseif ($request->get('type') == 'page' || $request->get('type') == 'snippet' || $request->get('type') == 'email') {
                $createValues += Tool::getRoutingDefaults();
            }

            switch ($request->get('type')) {
                case 'page':
                    $document = Document\Page::create($request->get('parentId'), $createValues, false);
                    $document->setTitle($request->get('title', null));
                    $document->setProperty('navigation_name', 'text', $request->get('name', null), false);
                    $document->save();
                    $success = true;
                    break;
                case 'snippet':
                    $document = Document\Snippet::create($request->get('parentId'), $createValues);
                    $success = true;
                    break;
                case 'printpage':
                    $document = Document\Printpage::create($request->get('parentId'), $createValues);
                    $success = true;
                    break;

                default:
                    $classname = '\\Pimcore\\Model\\Document\\' . ucfirst($request->get('type'));

                    // this is the fallback for custom document types using prefixes
                    // so we need to check if the class exists first
                    if (!\Pimcore\Tool::classExists($classname)) {
                        $oldStyleClass = '\\Document_' . ucfirst($request->get('type'));
                        if (\Pimcore\Tool::classExists($oldStyleClass)) {
                            $classname = $oldStyleClass;
                        }
                    }

                    if (Tool::classExists($classname)) {
                        $document = $classname::create($request->get('parentId'), $createValues);
                        try {
                            $document->save();
                            $success = true;
                        } catch (\Exception $e) {
                            return $this->adminJson(['success' => false, 'message' => $e->getMessage()]);
                        }
                        break;
                    } else {
                        Logger::debug("Unknown document type, can't add [ " . $request->get('type') . ' ] ');
                    }
                    break;
            }
        } else {
            $errorMessage = "prevented adding a document because document with same path+key [ $intendedPath ] already exists";
            Logger::debug($errorMessage);
        }

        if ($success) {
            if ($request->get('translationsBaseDocument')) {
                $translationsBaseDocument = Document::getById($request->get('translationsBaseDocument'));

                $properties = $translationsBaseDocument->getProperties();
                $properties = array_merge($properties, $document->getProperties());
                $document->setProperties($properties);
                $document->setProperty('language', 'text', $request->get('language'));
                $document->save();

                $service = new Document\Service();
                $service->addTranslation($translationsBaseDocument, $document);

                if ($request->get("elements")) {

                    $newDoc = Document::getById($document->getId());
                    $translateDoc = Document::getById($request->get("translateDocId"));


                    $newDoc->setElements($translateDoc->getElements());

                    $elements = json_decode($request->get("elements"), true);

                    foreach ($elements as $key => $element) {
                        $newDoc->setRawElement($key, $element["type"], $element["data"]);
                    }

                    $newDoc->save();

                }
            }

            return JsonResponse::create([
                'success' => $success,
                'id' => $document->getId(),
                'type' => $document->getType(),
                'parentId' => $document->getParentId()
            ]);

        } else {
            return JsonResponse::create([
                'success' => $success,
                'message' => $errorMessage
            ]);
        }
    }
}
