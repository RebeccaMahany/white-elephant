import 'phaser';
import { createBanner, displayName, displayCharacter } from "./SceneUtils";
import { width, height } from "./../globals";

export default class GameWaitingRoom extends Phaser.Scene
{
    name: string;
    character: string;

    constructor()
    {
        super('game-waiting-room');
    }

    /**
     * @param {{ name: string, character: string }} data
     */
    init(data)
    {
        this.name = data.name;
        this.character = data.character;
    }

    preload()
    {
        this.load.image('candycane', 'assets/Christmas_Icon_Pack/Outlined_Icons/CandyCaneIconOutline.png');
        this.load.image('stocking', 'assets/Christmas_Icon_Pack/Outlined_Icons/StockingIconOutline.png');

        this.load.image('present', 'assets/Christmas_Icon_Pack/Outlined_Icons/RedPresentIconOutline.png');
        this.load.image('tree', 'assets/Christmas_Icon_Pack/Outlined_Icons/ChristmasTreeIconOutline.png');

        this.load.spritesheet(this.character, 'assets/characters/' + this.character + '.png', { frameWidth: 16, frameHeight: 17 });
    }

    create()
    {
        displayName(this, this.name);
        createBanner(this);
        displayCharacter(this, this.character);

        let waitingText = this.add.text(
            width/2,
            height/3,
            'Please\nwait\n',
            {
                fontFamily: 'earlygameboy',
                fontSize: '72px'
            }
        );
        waitingText.setOrigin(0.5);

        // Make the tree a lil bit bigger because it's tiny
        this.add.image(width/2, height/2, 'tree').setScale(2);
        this.add.image(width/2 - 25, height/2 + 100, 'present');
        this.add.image(width/2 + 25, height/2 + 100, 'present');
    }
}
