<?php

namespace asioso\QuickTranslateBundle\Controller;

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
