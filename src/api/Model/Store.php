<?php

namespace WhiteElephant\Model;

use WhiteElephant\Model\Entity\Game;
use WhiteElephant\Model\Entity\Player;
use WhiteElephant\Model\Entity\Present;
use \PDO;

class Store
{
    const PATH_TO_SQLITE_FILE = '../db/white-elephant.sqlite3';

    /** @var \PDO */
    private $connection;

    public function getGame(string $gameCode): ?Game
    {
        $select = '
            SELECT
                id,
                game_code AS gameCode,
                current_player_id AS currentPlayerId,
                start_time AS startTime
            FROM game
            WHERE game_code = :code;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':code', $gameCode);
        $stmt->execute();
        $stmt->setFetchMode(\PDO::FETCH_CLASS, Game::class);
        $result = $stmt->fetch();
        if (!$result) {
            return null;
        }

        return $result;
    }

    public function getGameById(int $gameId): ?Game
    {
        $select = '
            SELECT
                id,
                game_code AS gameCode,
                current_player_id AS currentPlayerId,
                start_time AS startTime
            FROM game
            WHERE id = :id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':id', $gameId);
        $stmt->execute();
        $stmt->setFetchMode(\PDO::FETCH_CLASS, Game::class);
        $result = $stmt->fetch();
        if (!$result) {
            return null;
        }

        return $result;
    }

    public function createPlayer(string $name, int $gameId): int
    {
        $insert = '
            INSERT INTO player (name, game_id)
            VALUES (:name, :game_id);
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($insert);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();

        // Now get the last insert ID -- we can safely filter on name and game ID due to unique constraints
        $select = '
            SELECT id FROM player WHERE name=:name AND game_id=:game_id;
        ';
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public function setPlayerSprite(string $sprite, int $playerId, int $gameId)
    {
        $update = '
            UPDATE player SET sprite=:sprite WHERE id=:id AND game_id=:game_id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($update);
        $stmt->bindParam(':sprite', $sprite);
        $stmt->bindParam(':id', $playerId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
    }

    public function createPresent(string $description, int $fromPlayerId, int $gameId)
    {
        $insert = '
            INSERT INTO present (description, from_player_id, current_player_id, game_id)
            VALUES (:description, :from_id, :current_id, :game_id);
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($insert);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':from_id', $fromPlayerId);
        $stmt->bindParam(':current_id', $fromPlayerId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
    }

    public function getAllPlayers(int $gameId): array
    {
        $select = '
            SELECT id, name, sprite
            FROM player
            WHERE game_id = :game_id
            ORDER BY id ASC;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_CLASS, Player::class);
        if (!$result) {
            return [];
        }

        return $result;
    }

    public function getAllPresents(int $gameId): array
    {
        $select = '
            SELECT
                present.id,
                present.description,
                present.from_player_id AS fromPlayerId,
                name AS fromPlayerName,
                present.current_player_id AS currentPlayerId,
                present.unwrapped
            FROM present
            JOIN player ON present.from_player_id = player.id
            WHERE present.game_id = :game_id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
        $stmt->setFetchMode(\PDO::FETCH_CLASS, Present::class);
        $result = $stmt->fetchAll();
        if (!$result) {
            return [];
        }

        return $result;
    }

    public function getPresent(int $gameId, int $presentId): ?Present
    {
        $select = '
            SELECT
                present.id,
                present.description,
                present.from_player_id AS fromPlayerId,
                name AS fromPlayerName,
                present.current_player_id AS currentPlayerId,
                present.unwrapped
            FROM present
            JOIN player ON present.from_player_id = player.id
            WHERE present.id=:id
            AND present.game_id = :game_id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':id', $presentId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
        $stmt->setFetchMode(\PDO::FETCH_CLASS, Present::class);
        $result = $stmt->fetch();
        if (!$result) {
            return null;
        }

        return $result;
    }

    public function setGameStartTime(int $gameId, int $startTime)
    {
        $update = '
            UPDATE game SET start_time=:time WHERE id=:id
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($update);
        $stmt->bindParam(':time', $startTime);
        $stmt->bindParam(':id', $gameId);
        $stmt->execute();
    }

    public function setCurrentPlayer(int $gameId, int $playerId)
    {
        $update = '
            UPDATE game SET current_player_id=:player_id WHERE id=:id
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($update);
        $stmt->bindParam(':player_id', $playerId);
        $stmt->bindParam(':id', $gameId);
        $stmt->execute();
    }

    public function setPresentOwner(int $gameId, int $playerId, int $presentId)
    {
        $update = '
            UPDATE present SET current_player_id=:player_id
            WHERE id=:id
            AND game_id=:game_id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($update);
        $stmt->bindParam(':player_id', $playerId);
        $stmt->bindParam(':id', $presentId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
    }

    public function setPresentUnwrapped(int $gameId, int $presentId)
    {
        $update = '
            UPDATE present SET unwrapped=True
            WHERE id=:id
            AND game_id=:game_id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($update);
        $stmt->bindParam(':id', $presentId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
    }

    private function getConnection(): \PDO
    {
        if ($this->connection === null) {
            $this->connection = new \PDO('sqlite:' . self::PATH_TO_SQLITE_FILE);
            $this->connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        }

        return $this->connection;
    }
}
