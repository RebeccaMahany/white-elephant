import 'phaser';
import { displayBanner, displayName, displayCharacter, displayError } from "./../SceneUtils";
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
        displayBanner(this);
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
                    this.submitPresents(firstPresentInput.value, secondPresentInput.value);
                }
            }
        });
    }

    async submitPresents(firstPresent: string, secondPresent: string)
    {
        let postBody = {
            'first_description': firstPresent,
            'second_description': secondPresent
        };
        const response = await fetch('/ajax/create-presents', {
            method: 'POST',
            body: JSON.stringify(postBody),
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
            this.scene.start('game-waiting-room', {
                character: this.character,
                name: this.name
            });
        }
    }
}
