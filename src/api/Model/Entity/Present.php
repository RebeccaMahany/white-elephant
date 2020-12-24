<?php

namespace WhiteElephant\Model\Entity;

class Present
{
    /** @var int */
    private $id;

    /** @var string */
    private $description;

    /** @var int */
    private $fromPlayerId;

    /** @var string */
    private $fromPlayerName;

    /** @var int */
    private $currentPlayerId;

    public function getId(): int
    {
        return $this->id;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getFromPlayerId(): int
    {
        return $this->fromPlayerId;
    }

    public function getFromPlayerName(): string
    {
        return $this->fromPlayerName;
    }

    public function getCurrentPlayerId(): int
    {
        return $this->currentPlayerId;
    }
}
