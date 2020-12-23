<?php

namespace WhiteElephant\Model\Entity;

class Player
{
    /** @var int */
    private $id;

    /** @var string */
    private $name;

    /** @var Present[] */
    private $presents;

    public function getId(): int
    {
        return $this->id;
    }
}
