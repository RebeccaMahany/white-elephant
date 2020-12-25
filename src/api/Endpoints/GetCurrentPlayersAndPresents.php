<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;
use WhiteElephant\Model\Store;
use WhiteElephant\Model\Entity\Game;

class GetCurrentPlayersAndPresents extends ApiRequest
{
    public function execute(): array
    {
        $gameId = $this->getGameId();
        $currentPlayerId = $this->getPlayerId();

        $store = new Store();
        $game = $store->getGameById($gameId);
        $players = $store->getAllPlayers($gameId);
        $presents = $store->getAllPresents($gameId);

        $return = [
            'is_started' => $game->isStarted(),
            'seconds_left' => $this->getTimeLeftInSeconds($game),
            'my_turn' => $game->getCurrentPlayerId() === $currentPlayerId,
            'players' => [],
            'presents' => [],
        ];
        foreach ($players as $player) {
            if ($player->getId() === $game->getCurrentPlayerId()) {
                $return['current_player_name'] = $player->getName();
                $return['current_player_id'] = $player->getId();
            }
            $playerArray = [
                'id' => $player->getId(),
                'name' => $player->getName(),
                'sprite' => $player->getSprite(),
                'is_me' => $player->getId() === (int)$currentPlayerId,
                'presents' => []
            ];

            foreach ($presents as $present) {
                if ($present->getCurrentPlayerId() === $player->getId()) {
                    $playerArray['presents'][] = [
                        'id' => $present->getId(),
                        'description' => $present->getDescription(),
                        'from_player_id' => $present->getFromPlayerId(),
                        'from_player_name' => $present->getFromPlayerName(),
                        'unwrapped' => $present->isUnwrapped()
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
                'from_player_name' => $present->getFromPlayerName(),
                'unwrapped' => $present->isUnwrapped()
            ];

            $return['presents'][]= $presentArray;
        }

        return $return;
    }

    private function getTimeLeftInSeconds(Game $game): ?int
    {
        if ($game->getStartTime() === null) {
            return null;
        }

        $endTime = $game->getStartTime() + 1200; // 20 minutes
        $timeLeft = $endTime - time();

        if ($timeLeft < 0) {
            return 0;
        }

        return $timeLeft;
    }
}
