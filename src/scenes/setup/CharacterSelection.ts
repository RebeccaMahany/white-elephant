import 'phaser';
import { displayBanner, displayName, displayError } from "./../SceneUtils";
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
                let playerNum = (y*6) + x + 1;

                // Create the option and make it interactive
                this.add.sprite(startX, startY, 'player' + playerNum).setInteractive();
                startX += stepX;
            }
            startX = 64;
            startY += stepY;
        }

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            this.setPlayerSprite(gameObject.texture.key);
        });
    }

    async setPlayerSprite(sprite: string)
    {
        let putBody = {
            'sprite': sprite
        };
        const response = await fetch('/ajax/set-player-sprite', {
            method: 'PUT',
            body: JSON.stringify(putBody),
            headers: {'Content-Type': 'application/json; charset=UTF-8'}
        });

        if (!response.ok) {
            let errMsgDetails = 'Unknown error occurred';
            let errResponse = await response.json();
            if (errResponse['error']) {
                errMsgDetails = errResponse['error'];
            }
            displayError(this, 'Something went wrong --\ntry again?', errMsgDetails);
        } else {
            this.scene.start('presents-input', {
                character: sprite,
                name: this.name
            });
        }
    }
}
