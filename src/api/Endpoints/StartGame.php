<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;
use WhiteElephant\Model\Entity\Player;

class StartGame extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();

        $store = new Store();

        // Confirm game isn't already started
        $game = $store->getGameById($gameId);
        if ($game === null) {
            throw new ApiException(404, 'Game not found');
        }
        if ($game->getStartTime() !== null) {
            throw new ApiException(400, 'Cannot start game because it has already started');
        }

        $startTime = time();
        $store->setGameStartTime($gameId, $startTime);

        // Pick a player to be first -- pick whoever joined first
        $players = $store->getAllPlayers($gameId);
        if (count($players) === 0) {
            throw new ApiException(400, 'Cannot start game with no players');
        }

        $store->setCurrentPlayer($gameId, $players[0]->getId());

        return [];
    }
}
