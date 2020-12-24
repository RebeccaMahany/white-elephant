import 'phaser';
import { displayBanner, displayName, displayCharacter } from "./SceneUtils";
import { width, height } from "./../globals";

export default class GameWaitingRoom extends Phaser.Scene
{
    name: string;
    character: string;
    addedOtherPlayerIds: number[] = [];
    addedPresentIds: number[] = [];
    currentPopoverElements: Phaser.GameObjects.GameObject[] = [];

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

        this.load.image('red-present', 'assets/Christmas_Icon_Pack/Outlined_Icons/RedPresentIconOutline.png');
        this.load.image('green-present', 'assets/Christmas_Icon_Pack/Outlined_Icons/GreenPresentIconOutline.png');
        this.load.image('tree', 'assets/Christmas_Icon_Pack/Outlined_Icons/ChristmasTreeIconOutline.png');

        const playerFrameConfig = { frameWidth: 16, frameHeight: 17 };
        for (let i = 1; i <= 24; i++) {
            const playerKey = 'player' + i;
            let src = 'assets/characters/' + playerKey + '.png';
            this.load.spritesheet(playerKey, src, playerFrameConfig);
        }

        this.load.html('start-game-form', 'assets/html/start-game-form.html');
    }

    create()
    {
        displayName(this, this.name);
        displayBanner(this);
        displayCharacter(this, this.character);

        let waitingText = this.add.text(
            200,
            height/4,
            'Please\nwait\n',
            {
                fontFamily: 'earlygameboy',
                fontSize: '48px'
            }
        );
        waitingText.setOrigin(0.5);

        // Make the tree a lil bit bigger because it's tiny
        this.add.image(width/2, height/2, 'tree').setScale(2);

        // Fetch current players and presents, and start to set them up around the screen
        this.pollForNewPlayersAndPresents();

        // Set up listener for popovers for presents
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.texture) {
                if (gameObject.texture.key === 'red-present' || gameObject.texture.key === 'green-present') {
                    this.displayPopover(pointer, gameObject);
                }
            }
        });

        // Create button to start game and advance to next scene on submit
        let form = this.add.dom(3*width/4, height - 30).createFromCache('start-game-form');
        form.addListener('click');
        form.on('click', (event) => {
            if (event.target.name === 'submitButton') {
                this.scene.start('game-phase-1', {
                    character: this.character,
                    name: this.name
                });
            }
        });
    }

    async pollForNewPlayersAndPresents()
    {
        const response = await fetch('/ajax/get-current', {headers: {'Content-Type': 'application/json; charset=UTF-8'}});

        if (response.ok) {
            let jsonResponse = await response.json();

            // Add all the players
            for (let i = 0; i < jsonResponse['players'].length; i++) {
                if (jsonResponse['players'][i]['current'] === true) {
                    // We don't need to display the current character -- they're in the botton left already
                    continue;
                }
                if (this.addedOtherPlayerIds.includes(jsonResponse['players'][i]['id'])) {
                    // Already added this player in a previous iteration
                    continue;
                }

                this.displayCharacterInNextSpot(jsonResponse['players'][i]['sprite'], jsonResponse['players'][i]['name']);
                this.addedOtherPlayerIds.push(jsonResponse['players'][i]['id']);
            }

            // Add all the presents
            for (let i = 0; i < jsonResponse['presents'].length; i++) {
                if (this.addedPresentIds.includes(jsonResponse['presents'][i]['id'])) {
                    // Already added this present in a previous iteration
                    continue;
                }
                this.displayPresentInNextSpot(jsonResponse['presents'][i]['from_player_name']);
                this.addedPresentIds.push(jsonResponse['presents'][i]['id']);
            }
        }

        setTimeout(() => { this.pollForNewPlayersAndPresents(); }, 5000);
    }

    displayCharacterInNextSpot(sprite: string, name: string)
    {
        const leftX = 15;
        const rightX = width - 15;
        const yStep = 150;

        let w;
        let o;
        if (this.addedOtherPlayerIds.length % 2 === 0) {
            w = leftX;
            o = 0; // left-align
        } else {
            w = rightX;
            o = 1; // right-align
        }

        let h = height/3 + (yStep * Math.floor(this.addedOtherPlayerIds.length/2));

        let displayedCharacter = this.add.sprite(w, h, sprite);
        displayedCharacter.setOrigin(o);

        // Display the player's name under the player.
        let nameText = this.add.text(
            w,
            h + 20,
            name,
            {
                fontFamily: 'earlygameboy',
                fontSize: '10px'
            }
        );
        nameText.setOrigin(o);
    }

    displayPresentInNextSpot(fromPlayerName: string)
    {
        let key = 'red-present';
        if (this.addedPresentIds.length % 2 === 0) {
            key = 'green-present';
        }

        const startX = width/2 - 60;
        const startY = 2 * height/3;
        const step = 30;
        const presentsPerRow = 4;

        const rowNum = Math.floor(this.addedPresentIds.length/presentsPerRow);
        const colNum = this.addedPresentIds.length % presentsPerRow;

        let w = startX + (colNum * step);
        let h = startY + (rowNum * step);

        let present = this.add.image(w, h, key);
        present.setData('from-player', fromPlayerName);
        present.setInteractive();
    }

    displayPopover(pointer, gameObject)
    {
        let fromText = 'From: ' + gameObject.getData('from-player');
        let descriptionText = 'Description: ?????';
        const popoverWidth = 200;
        const popoverHeight = 75;
        const popoverPadding = 10;
        const buttonWidthHeight = 8;
        const buttonPadding = 4;

        let popover = this.add.rectangle(pointer.x, pointer.y, popoverWidth, popoverHeight, 0x222222, 0.5);
        popover.setDisplayOrigin(0, 0);

        let content = this.add.text(
            0,
            0,
            fromText + '\n' + descriptionText,
            {
                fontFamily: 'earlygameboy',
                fontSize: 10, wordWrap: { width: popoverWidth - (popoverPadding * 2) }
            }
        );
        let b = content.getBounds();
        content.setPosition(popover.x + (popoverWidth / 2) - (b.width / 2), popover.y + (popoverHeight / 2) - (b.height / 2));

        let closeButton = this.add.rectangle(
            pointer.x + popoverWidth - buttonWidthHeight - buttonPadding,
            pointer.y + buttonPadding,
            buttonWidthHeight,
            buttonWidthHeight,
            0x222222,
            1
        );
        closeButton.setDisplayOrigin(0, 0);
        let closeButtonX = this.add.text(0, 0, 'x', {fontFamily: 'earlygameboy', fontSize: 8});
        let closeButtonBounds = closeButton.getBounds();
        closeButtonX.setPosition(
            closeButton.x + (buttonWidthHeight/2) - (closeButtonBounds.width/2),
            closeButton.y + (buttonWidthHeight/2) - (closeButtonBounds.height/2)
        );

        // Add all these objects to a list so we can destroy them at the same time when the X is clicked
        this.currentPopoverElements.push(closeButtonX);
        this.currentPopoverElements.push(closeButton);
        this.currentPopoverElements.push(content);
        this.currentPopoverElements.push(popover);

        closeButton.setInteractive();
        closeButton.addListener('pointerdown', () => {
            for (let i = this.currentPopoverElements.length - 1; i >= 0; i--) {
                this.currentPopoverElements[i].destroy();
            }
            this.currentPopoverElements = [];
        });
    }
}
