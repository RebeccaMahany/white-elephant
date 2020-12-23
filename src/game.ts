import 'phaser';
import EnterGame from "./scenes/setup/EnterGame";
import NameInput from "./scenes/setup/NameInput";
import CharacterSelection from "./scenes/setup/CharacterSelection";
import PresentsInput from "./scenes/setup/PresentsInput";
import GameWaitingRoom from "./scenes/GameWaitingRoom";
import GamePhase1 from "./scenes/GamePhase1";
import GamePhase2 from "./scenes/GamePhase2";
import { width, height } from "./globals";

const config = {
    type: Phaser.AUTO,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#e3d5a3',
    parent: 'phaser-example', // TODO what is this
    dom: {
        createContainer: true
    },
    width: width,
    height: height,
    scene: [ EnterGame, NameInput, CharacterSelection, PresentsInput, GameWaitingRoom, GamePhase1, GamePhase2 ]
};

const game = new Phaser.Game(config);
