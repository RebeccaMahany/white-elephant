<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;

class TakePresent extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $playerId = $this->getPlayerId();
        if (!isset($this->requestBody['present_id'])) {
            throw new ApiException(400, 'missing present_id parameter');
        }

        $presentId = $this->requestBody['present_id'];

        $store = new Store();
        $present = $store->getPresent($gameId, $presentId);
        if ($present === null) {
            throw new ApiException(404, 'no present found by present_id');
        }
        if ($present->getCurrentPlayerId() === (int)$playerId && $present->isUnwrapped()) {
            throw new ApiException(400, 'player already has present');
        }

        $store->setPresentOwner($gameId, $playerId, $presentId);
        $store->setPresentUnwrapped($gameId, $presentId);

        return [];
    }
}
