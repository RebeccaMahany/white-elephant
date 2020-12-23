<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\Model\Store;

class CreatePresents extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $playerId = $this->getPlayerId();
        if (!isset($this->requestBody['first_description']) || !isset($this->requestBody['second_description'])) {
            throw new ApiException(400, 'missing first_description and/or second_description parameters');
        }

        $store = new Store();
        $firstPresentId = $store->createPresent($this->requestBody['first_description'], $playerId, $gameId);
        $secondPresentId = $store->createPresent($this->requestBody['second_description'], $playerId, $gameId);

        return [
            'first_present_id' => $firstPresentId,
            'second_present_id' => $secondPresentId
        ];
    }
}
