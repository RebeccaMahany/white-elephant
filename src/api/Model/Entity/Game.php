<?php

namespace WhiteElephant\Model\Entity;

class Game
{
    /** @var int */
    private $id;

    /** @var string */
    private $gameCode;

    /** @var int|null */
    private $currentPlayerId;

    /** @var int|null */
    private $startTime;

    public function getId(): int
    {
        return $this->id;
    }

    public function getCurrentPlayerId(): ?int
    {
        return $this->currentPlayerId;
    }

    public function getStartTime(): ?int
    {
        return $this->startTime;
    }

    public function isStarted(): bool
    {
        return $this->startTime !== null && $this->startTime > 0;
    }
}
