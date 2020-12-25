<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;

class EndTurn extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $playerId = $this->getPlayerId();

        $store = new Store();
        $game = $store->getGameById($gameId);
        if ($game->getCurrentPlayerId() !== $playerId) {
            throw new ApiException(400, 'cannot end turn for player because it is not their turn');
        }

        $players = $store->getAllPlayers($gameId);
        $currentPlayerIndex = -1;
        foreach ($players as $i => $player) {
            if ($player->getId() === (int) $playerId) {
                $currentPlayerIndex = $i;
            }
        }
        $nextPlayerIndex = $currentPlayerIndex + 1;
        if ($nextPlayerIndex >= count($players)) {
            $nextPlayerIndex = 0;
        }

        $store->setCurrentPlayer($gameId, $players[$nextPlayerIndex]->getId());

        return [];
    }
}
