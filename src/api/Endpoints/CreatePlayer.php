<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;

class CreatePlayer extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        if (!isset($this->requestBody['name'])) {
            throw new ApiException(400, 'missing name parameter');
        }

        $store = new Store();
        $newPlayerId = $store->createPlayer($this->requestBody['name'], $gameId);

        $this->setPlayerId($newPlayerId);

        return ['id' => $newPlayerId];
    }
}
