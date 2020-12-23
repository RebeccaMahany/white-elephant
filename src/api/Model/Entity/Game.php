<?php

namespace WhiteElephant\Model\Entity;

class Game
{
    /** @var int */
    private $id;

    /** @var string */
    private $gameCode;

    /** @var Player[] */
    private $players;

    /** @var Present[] */
    private $presents;

    public function getId(): int
    {
        return $this->id;
    }
}
