<?php

namespace WhiteElephant\Model;

use WhiteElephant\Model\Entity\Game;
use WhiteElephant\Model\Entity\Player;
use \PDO;

class Store
{
    const PATH_TO_SQLITE_FILE = '../db/white-elephant.sqlite3';

    /** @var \PDO */
    private $connection;

    public function getGame(string $gameCode): ?Game
    {
        $select = '
            SELECT id, game_code
            FROM game
            WHERE game_code = :code;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':code', $gameCode);
        $stmt->execute();
        $stmt->setFetchMode(PDO::FETCH_CLASS, Game::class);
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

    public function createPresent(string $description, int $fromPlayerId, int $gameId): int
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

        // Now get the last insert ID -- we can safely filter on name and game ID due to unique constraints
        $select = '
            SELECT id FROM present WHERE description=:description AND from_player_id=:from_id AND game_id=:game_id;
        ';
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':from_id', $fromPlayerId);
        $stmt->bindParam(':game_id', $gameId);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public function getAllPlayers(int $gameId): array
    {
        $select = '
            SELECT id, name
            FROM player
            WHERE game_id = :id;
        ';

        $conn = $this->getConnection();
        $stmt = $conn->prepare($select);
        $stmt->bindParam(':id', $gameId);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_CLASS, Player::class);
        if (!$result) {
            return [];
        }

        return $result;
    }

    private function getConnection(): \PDO
    {
        if ($this->connection === null) {
            $this->connection = new \PDO('sqlite:' . self::PATH_TO_SQLITE_FILE);
        }

        return $this->connection;
    }
}
