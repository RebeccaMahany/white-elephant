import 'phaser';
import { displayBanner, displayName, displayCharacter } from "./SceneUtils";
import { width, height } from "./../globals";

export default class GamePhase1 extends Phaser.Scene
{
    name: string;
    character: string;

    constructor()
    {
        super('game-phase-1');
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

        this.load.image('red-present', 'assets/Christmas_Icon_Pack/Outlined_Icons/RedPresentIconOutline.png');
        this.load.image('green-present', 'assets/Christmas_Icon_Pack/Outlined_Icons/GreenPresentIconOutline.png');
        this.load.image('tree', 'assets/Christmas_Icon_Pack/Outlined_Icons/ChristmasTreeIconOutline.png');

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
        displayCharacter(this, this.character);

        // Make the tree a lil bit bigger because it's tiny
        this.add.image(width/2, height/2, 'tree').setScale(2);

        this.displayPlayersAndPresents();
    }

    async displayPlayersAndPresents()
    {
        const response = await fetch('/ajax/get-current', {headers: {'Content-Type': 'application/json; charset=UTF-8'}});

        if (response.ok) {
            let jsonResponse = await response.json();

            // Add all the players
            const leftX = 15;
            const rightX = width - 15;
            const yStep = 150;
            for (let i = 0; i < jsonResponse['players'].length; i++) {
                if (jsonResponse['players'][i]['current'] === true) {
                    // We don't need to display the current character -- they're in the botton left already
                    continue;
                }

                let w;
                let o;
                if (i % 2 === 0) {
                    w = leftX;
                    o = 0; // left-align
                } else {
                    w = rightX;
                    o = 1; // right-align
                }

                let h = height/3 + (yStep * Math.floor(i/2));

                let displayedCharacter = this.add.sprite(w, h, jsonResponse['players'][i]['sprite']);
                displayedCharacter.setOrigin(o);

                // Display the player's name under the player.
                let nameText = this.add.text(
                    w,
                    h + 20,
                    jsonResponse['players'][i]['name'],
                    {
                        fontFamily: 'earlygameboy',
                        fontSize: '10px'
                    }
                );
                nameText.setOrigin(o);
            }

            // Add all the presents
            const startX = width/2 - 60;
            const startY = 2 * height/3;
            const step = 30;
            const presentsPerRow = 4;
            for (let i = 0; i < jsonResponse['presents'].length; i++) {
                let key = 'red-present';
                if (i % 2 === 0) {
                    key = 'green-present';
                }

                const rowNum = Math.floor(i/presentsPerRow);
                const colNum = i % presentsPerRow;

                let w = startX + (colNum * step);
                let h = startY + (rowNum * step);

                let present = this.add.image(w, h, key);
                present.setData('from-player', jsonResponse['presents'][i]['from_player_name']);
                present.setInteractive();
            }
        }
    }
}
