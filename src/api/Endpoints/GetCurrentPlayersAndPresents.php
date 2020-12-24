<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;

class GetCurrentPlayersAndPresents extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $currentPlayerId = $this->getPlayerId();

        $store = new Store();
        $players = $store->getAllPlayers($gameId);
        $presents = $store->getAllPresents($gameId);

        $return = [
            'players' => [],
            'presents' => [],
        ];
        foreach ($players as $player) {
            $playerArray = [
                'id' => $player->getId(),
                'name' => $player->getName(),
                'sprite' => $player->getSprite(),
                'current' => $player->getId() === (int)$currentPlayerId,
                'presents' => []
            ];

            foreach ($presents as $present) {
                if ($present->getCurrentPlayerId() === $player->getId()) {
                    $playerArray['presents'][] = [
                        'id' => $present->getId(),
                        'description' => $present->getDescription(),
                        'from_player_id' => $present->getFromPlayerId(),
                        'from_player_name' => $present->getFromPlayerName()
                    ];
                }
            }

            $return['players'][] = $playerArray;
        }

        foreach ($presents as $present) {
            $presentArray = [
                'id' => $present->getId(),
                'description' => $present->getDescription(),
                'from_player_id' => $present->getFromPlayerId(),
                'from_player_name' => $present->getFromPlayerName()
            ];

            $return['presents'][]= $presentArray;
        }

        return $return;
    }
}
