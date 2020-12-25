<?php

namespace WhiteElephant;

class ApiException extends \Exception
{
    /** @var int */
    private $httpStatusCode;

    public function __construct(int $httpStatusCode, string $message = null, int $code = 0, Exception $previous = null)
    {
        $this->httpStatusCode = $httpStatusCode;
        parent::__construct($message, $code, $previous);
    }

    public function getHttpStatusCode(): int
    {
        return $this->httpStatusCode;
    }
}