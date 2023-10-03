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
use Pimcore\Model\DataObject;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class ObjectController extends FrontendController
{

    public function translateObjectAction(Request $request)
    {

        try {
            $itemId = $request->get('id');
            $localizedField = $request->get('locale');
            $data = json_decode($request->get('data'));

            $item = DataObject::getById($itemId);

            foreach ($data as $key => $value) {
                if (str_contains($key, 'structuredData#')) {
                    list($prefix, $fieldName, $index, $type, $strField) = explode('.', $key);

                    $structuredField = $item->get($fieldName);

                    if ($structuredField instanceof DataObject\Fieldcollection) {
                        $structuredField->setObject($item);
                        $structuredField->get($index)->set($strField, $value, $localizedField);
                    }

                    if ($structuredField instanceof DataObject\Objectbrick) {
                        $structuredField->setObject($item);
                        $structuredField->get($type)->set($strField, $value, $localizedField);
                    }

                    if (is_array($structuredField) && $type === 'undefined') {
                        $blockItem = $structuredField[$index];
                        $localizedFields = $blockItem['localizedfields']->getData();
                        $localizedFields->setLocalizedValue($strField, $value, $localizedField);
                    }

                } elseif (str_contains($key, 'classificationStore#')) {
                    list($prefix, $index, $fieldName, $strField) = explode('.', $key);

                    $structuredField = $item->get($fieldName);

                    if ($structuredField instanceof DataObject\Classificationstore) {
                        $structuredField->setObject($item);
                        $structuredField->setLocalizedKeyValue($index, $strField, $value, $localizedField);
                    }
                } else {
                    $item->set($key, $value, $localizedField);
                }
            }

            $item->save();

            return new JsonResponse("true");

        } catch (\Exception $e) {
            return new JsonResponse("false");
        }

    }
}
