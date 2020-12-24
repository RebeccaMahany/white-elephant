import 'phaser';
import CharacterSelection from "./CharacterSelection";
import { displayBanner, displayError } from "./../SceneUtils";
import { width, height } from "./../../globals";

export default class NameInput extends Phaser.Scene
{
    errorMessages: Phaser.GameObjects.Text[] = [];

    constructor()
    {
        super('name-input');
    }

    preload()
    {
        this.load.image('candycane', 'assets/Christmas_Icon_Pack/Outlined_Icons/CandyCaneIconOutline.png');
        this.load.image('stocking', 'assets/Christmas_Icon_Pack/Outlined_Icons/StockingIconOutline.png');

        this.load.html('name-form', 'assets/html/name-form.html');
    }

    create()
    {
        displayBanner(this);

        let prompt = this.add.text(
            width/2,
            height/4,
            'Enter\nyour\nname',
            {
                fontFamily: 'earlygameboy',
                fontSize: '48px'
            }
        );
        prompt.setOrigin(0.5);

        // Create input element and advance to next scene on submit
        let form = this.add.dom(width/2, height/2).createFromCache('name-form');
        form.addListener('click');
        form.on('click', (event) => {
            if (event.target.name === 'submitButton') {
                let inputText = event.target.previousElementSibling.value;
                if (inputText !== '') {
                    this.submitPlayerName(inputText)
                }
            }
        });
    }

    async submitPlayerName(name: string)
    {
        let postBody = {
            'name': name
        };
        const response = await fetch('/ajax/create-player', {
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
            this.scene.start('character-selection', { name: name });
        }
    }
}
