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
                $item->set($key, $value, $localizedField);
            }

            $item->save();

            JsonResponse::create("true")->send();

        } catch (\Exception $e) {
            JsonResponse::create("false")->send();
        }

    }
}
