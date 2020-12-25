<?php

include('../src/api/Route.php');
use WhiteElephant\ApiException;
use WhiteElephant\Route;
use WhiteElephant\Endpoints\CreatePlayer;
use WhiteElephant\Endpoints\CreatePresents;
use WhiteElephant\Endpoints\EndTurn;
use WhiteElephant\Endpoints\EnterGame;
use WhiteElephant\Endpoints\GetCurrentPlayersAndPresents;
use WhiteElephant\Endpoints\SetPlayerSprite;
use WhiteElephant\Endpoints\StartGame;
use WhiteElephant\Endpoints\TakePresent;

function autoloadSrc ($pClassName) {
    $className = str_replace('\\', '/', $pClassName);
    $className = str_replace('WhiteElephant', 'api', $className);
    include(__DIR__ . '/../src/' . $className . '.php');
}
spl_autoload_register('autoloadSrc');

ini_set('session.cookie_lifetime', 60 * 60 * 24);
session_start();

// I didn't really want to pull in an entire framework for this, so here's some super basic routing
// for the endpoints that the frontend needs.

// Get request and path
$requestUrl = parse_url($_SERVER['REQUEST_URI']);
if (isset($requestUrl['path'])) {
    $requestPath = $requestUrl['path'];
} else {
    $requestPath = '/';
}
$requestMethod = $_SERVER['REQUEST_METHOD'];

$routes = [];
// Setup
$routes[] = new Route('/ajax/enter-game', 'POST', EnterGame::class);
$routes[] = new Route('/ajax/create-player', 'POST', CreatePlayer::class);
$routes[] = new Route('/ajax/set-player-sprite', 'PUT', SetPlayerSprite::class);
$routes[] = new Route('/ajax/create-presents', 'POST', CreatePresents::class);
$routes[] = new Route('/ajax/start-game', 'PUT', StartGame::class);
// Game, phases 1 and 2
$routes[] = new Route('/ajax/get-current', 'GET', GetCurrentPlayersAndPresents::class);
$routes[] = new Route('/ajax/take-present', 'PUT', TakePresent::class);
$routes[] = new Route('/ajax/end-turn', 'PUT', EndTurn::class);

foreach ($routes as $route) {
    if ($requestMethod === $route->getHttpMethod() && $requestPath === $route->getPath()) {
        $endpointClass = $route->getEndpointClass();
        $endpoint = new $endpointClass();

        header('Content-Type: application/json');
        try {
            $response = $endpoint->execute();
            $jsonResponse = json_encode($response);
            http_response_code(200);
            echo $jsonResponse;
        } catch (ApiException $apiException) {
            http_response_code($apiException->getHttpStatusCode());
            $errMsg = $apiException->getMessage();
            error_log($errMsg);
            $jsonResponse = json_encode(['error' => $errMsg]);
            echo $jsonResponse;
        } catch (\Exception $e) {
            http_response_code(500);
            $errMsg = $e->getMessage();
            error_log($errMsg);
            $jsonResponse = json_encode(['error' => $errMsg]);
            echo $jsonResponse;
        }

        exit();
    }
}

?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" name="viewport" content="width=480, height=800, user-scalable=no, maximum-scale=0.8">
    <script src="game.js"></script>

    <style media='screen' type='text/css'>
      @font-face {
        font-family: earlygameboy;
        src: url('assets/fonts/early_gameboy.ttf');
        font-weight: 400;
        font-weight: normal;
      }
      button {
        color: #555659;
        font-family : inherit;
        font-size: 1em;
        background-color: #dde2eb;
        border: none;
        padding: 10px 16px;
      }
      button:disabled,
      button[disabled] {
        color: #78797d;
        font-family : inherit;
        font-size: 1em;
        background-color: #ebedf0;
        border: none;
        padding: 10px 16px;
      }
    </style>
  </head>
  <body style="background-color:#e3d5a3; font-family:earlygameboy">
  </body>
</html>
