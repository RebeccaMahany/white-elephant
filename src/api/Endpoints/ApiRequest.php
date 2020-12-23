<?php

namespace WhiteElephant\Endpoints;

use WhiteElephant\ApiException;

abstract class ApiRequest
{
    /** @var array */
    protected $requestBody;

    public function __construct()
    {
        $this->requestBody = json_decode(file_get_contents('php://input'), true);
    }

    public function setGameId(int $gameId)
    {
        $_SESSION['current-game-id'] = $gameId;
    }

    public function getGameId(): int
    {
        if (!isset($_SESSION['current-game-id'])) {
            throw new ApiException(400, 'no game ID set in session');
        }

        return $_SESSION['current-game-id'];
    }

    public function setPlayerId(int $playerId)
    {
        $_SESSION['player-id']= $playerId;
    }

    public function getPlayerId(): int
    {
        if (!isset($_SESSION['player-id'])) {
            throw new ApiException(400, 'no player ID set in session');
        }

        return $_SESSION['player-id'];
    }

    abstract public function execute(): array;
}
