<?php

namespace WhiteElephant\Model\Entity;

class Player
{
    /** @var int */
    private $id;

    /** @var string */
    private $name;

    /** @var string */
    private $sprite;

    /** @var Present[] */
    private $presents;

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getSprite(): string
    {
        return $this->sprite;
    }
}
