import 'phaser';
import { createBanner, displayName, displayCharacter } from "./../SceneUtils";
import { width, height } from "./../../globals";

export default class PresentsInput extends Phaser.Scene
{
    name: string;
    character: string;

    constructor()
    {
        super('presents-input');
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

        this.load.html('presents-form', 'assets/html/presents-form.html');

        this.load.spritesheet(this.character, 'assets/characters/' + this.character + '.png', { frameWidth: 16, frameHeight: 17 });
    }

    create()
    {
        displayName(this, this.name);
        createBanner(this);
        displayCharacter(this, this.character);

        let prompt = this.add.text(
            width/2,
            height/4,
            'Describe\nyour\npresents',
            {
                fontFamily: 'earlygameboy',
                fontSize: '48px'
            }
        );
        prompt.setOrigin(0.5);

        // Create input element and advance to next scene on submit
        let form = this.add.dom(width/2, height/2).createFromCache('presents-form');
        form.addListener('click');
        form.on('click', (event) => {
            if (event.target.name === 'submitButton') {
                let firstPresentInput = event.target.previousElementSibling;
                let secondPresentInput = firstPresentInput.previousElementSibling;
                if (firstPresentInput.value !== '' && secondPresentInput.value !== '') {
                    // TODO save presents
                    this.scene.start('game-waiting-room', {
                        character: this.character,
                        name: this.name
                    });
                }
            }
        });
    }
}
