<?php

namespace WhiteElephant;

class Route
{
    /** @var string */
    private $path;

    /** @var string */
    private $httpMethod;

    /** @var string */
    private $endpointClass;

    public function __construct(string $path, string $httpMethod, string $endpointClass)
    {
        $this->path = $path;
        $this->httpMethod = $httpMethod;
        $this->endpointClass = $endpointClass;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getHttpMethod(): string
    {
        return $this->httpMethod;
    }

    public function getEndpointClass(): string
    {
        return $this->endpointClass;
    }
}
