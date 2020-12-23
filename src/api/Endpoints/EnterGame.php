<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;

class EnterGame extends ApiRequest
{
    public function execute(): array
    {
        if (!isset($this->requestBody['game_code'])) {
            throw new ApiException(400, 'missing game_code parameter');
        }

        $store = new Store();
        $game = $store->getGame(strtoupper($this->requestBody['game_code']));

        if ($game === null) {
            throw new ApiException(404, 'game not found by code');
        }

        $this->setGameId($game->getId());

        return ['id' => $game->getId()];
    }
}
