<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\Model\Store;

class SetPlayerSprite extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $playerId = $this->getPlayerId();
        if (!isset($this->requestBody['sprite'])) {
            throw new ApiException(400, 'missing sprite parameter');
        }

        error_log($this->requestBody['sprite']);

        $store = new Store();
        $firstPresentId = $store->setPlayerSprite($this->requestBody['sprite'], $playerId, $gameId);

        return [];
    }
}
