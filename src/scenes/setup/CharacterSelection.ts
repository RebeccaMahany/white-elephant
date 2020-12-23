import 'phaser';
import { displayBanner, displayName } from "./../SceneUtils";
import { width, height } from "./../../globals";

export default class CharacterSelection extends Phaser.Scene
{
    name: string;

    constructor()
    {
        super('character-selection');
    }

    /**
     * @param {{ name: string }} data
     */
    init(data)
    {
        this.name = data.name;
    }

    preload()
    {
        this.load.image('candycane', 'assets/Christmas_Icon_Pack/Outlined_Icons/CandyCaneIconOutline.png');
        this.load.image('stocking', 'assets/Christmas_Icon_Pack/Outlined_Icons/StockingIconOutline.png');

        const playerFrameConfig = { frameWidth: 16, frameHeight: 17 };
        for (let i = 1; i <= 24; i++) {
            const playerKey = 'player' + i;
            let src = 'assets/characters/' + playerKey + '.png';
            this.load.spritesheet(playerKey, src, playerFrameConfig);
        }
    }

    create()
    {
        displayName(this, this.name);
        displayBanner(this);

        let prompt = this.add.text(
            width/2,
            height/4,
            'Choose\nyour\nplayer',
            {
                fontFamily: 'earlygameboy',
                fontSize: '48px'
            }
        );
        prompt.setOrigin(0.5);

        // Init all the player options, making a 4x6 grid of players
        let startX = 64;
        const stepX = 64;
        let startY = height/2;
        const stepY = 64;
        for (let y = 0; y < 4; y ++) {
            for (let x = 0; x < 6; x++) {
                let playerNum = (y+1) * (x+1);

                // Create the option and make it interactive
                var player = this.add.sprite(startX, startY, 'player' + playerNum).setInteractive();
                // Make player bigger on hover
                player.on('pointerover', function () {
                    this.setScale(2);
                });
                player.on('pointerout', function () {
                    this.setScale(1);
                });
                // Select player on click
                player.on('pointerdown', function() {
                    let selectedPlayerKey = this.texture.key;
                    this.scene.scene.start('presents-input', {
                        character: selectedPlayerKey,
                        name: this.scene.name
                    });
                }, player);
                startX += stepX;
            }
            startX = 64;
            startY += stepY;
        }
    }
}
