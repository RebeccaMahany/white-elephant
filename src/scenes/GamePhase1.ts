import 'phaser';
import { displayBanner, displayName, displayCharacter, displayError, clearErrors } from "./SceneUtils";
import { width, height } from "./../globals";

export default class GamePhase1 extends Phaser.Scene
{
    name: string;
    character: string;
    errorMessages: Phaser.GameObjects.Text[] = [];
    myTurn: boolean = false;
    myPlayerId: number;
    myGrid: Map<number, number> = new Map<number, number>();
    allowedToTakePresent: boolean = false;
    timeLeftObj = null;
    currentPlayerId = null;
    currentPlayerNameObj = null;
    currentPopoverElements: Phaser.GameObjects.GameObject[] = [];
    rollButton: Phaser.GameObjects.DOMElement = null;
    endTurnButton: Phaser.GameObjects.DOMElement = null;
    diceObj: Phaser.GameObjects.Text = null;
    presentObjs: Map<number, Phaser.GameObjects.Image> = new Map<number, Phaser.GameObjects.Image>();
    playerObjs: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();

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

        this.load.html('roll-button', 'assets/html/roll-button.html');
        this.load.html('end-turn-button', 'assets/html/end-turn-button.html');
    }

    create()
    {
        displayName(this, this.name);
        displayBanner(this);
        displayCharacter(this, this.character);

        // Make the tree a lil bit bigger because it's tiny
        this.add.image(width/2, height/2, 'tree').setScale(2);

        this.setUpGameBoard();

        // Set up listener for popovers for presents
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject.texture) {
                if (gameObject.texture.key === 'red-present' || gameObject.texture.key === 'green-present') {
                    this.displayPopover(pointer, gameObject);
                }
            }
        });
    }

    async setUpGameBoard()
    {
        const response = await fetch('/ajax/get-current', {headers: {'Content-Type': 'application/json; charset=UTF-8'}});

        if (response.ok) {
            let jsonResponse = await response.json();

            this.currentPlayerId = jsonResponse['current_player_id'];

            // Set up countdown timer
            this.displayCountdownTimer(jsonResponse['seconds_left']);

            // Display current player's turn
            if (jsonResponse['my_turn']) {
                this.myTurn = true;
            }
            this.displayCurrentPlayerTurn(jsonResponse['current_player_name']);

            // If current player, display buttons
            if (this.myTurn) {
                this.displayRollDiceButton();
            }

            // Add all the players
            const leftX = 10;
            const rightX = width - 10;
            const yStep = 150;
            let seenCurrentPlayer = false;
            for (let i = 0; i < jsonResponse['players'].length; i++) {
                if (jsonResponse['players'][i]['is_me'] === true) {
                    // We don't need to display the current character -- they're in the botton left already
                    this.myPlayerId = jsonResponse['players'][i]['id'];
                    seenCurrentPlayer = true;
                    continue;
                }

                let idx = i;
                if (seenCurrentPlayer) {
                    // Move back one slot to account for not having to display the current player
                    idx--;
                }

                let w;
                let o;
                if (idx % 2 === 0) {
                    w = leftX;
                    o = 0; // left-align
                } else {
                    w = rightX;
                    o = 1; // right-align
                }

                let h = height/3 + (yStep * Math.floor(idx/2));

                let displayedCharacter = this.add.sprite(w, h, jsonResponse['players'][i]['sprite']);
                displayedCharacter.setOrigin(o);
                displayedCharacter.setData('side', o === 0 ? 'left' : 'right');
                displayedCharacter.setData('presents-grid', new Map<number, number>());
                this.playerObjs.set(jsonResponse['players'][i]['id'], displayedCharacter);

                // Display the player's name under the player.
                let nameText = this.add.text(
                    w,
                    h + 20,
                    jsonResponse['players'][i]['name'],
                    {
                        fontFamily: 'earlygameboy',
                        fontSize: '8px'
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
                present.setData('description', jsonResponse['presents'][i]['description']);
                present.setData('unwrapped', jsonResponse['presents'][i]['unwrapped']);
                present.setData('id', jsonResponse['presents'][i]['id']);
                present.setInteractive();
                this.presentObjs.set(jsonResponse['presents'][i]['id'], present);
            }
        }

        await this.sleep(1000);
        this.updatePoll();
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async updatePoll()
    {
        const response = await fetch('/ajax/get-current', {headers: {'Content-Type': 'application/json; charset=UTF-8'}});

        if (response.ok) {
            let jsonResponse = await response.json();

            // Update the countdown timer
            this.displayCountdownTimer(jsonResponse['seconds_left']);

            this.myTurn = jsonResponse['my_turn'];

            // Update info about presents
            for (let i = 0; i < jsonResponse['presents'].length; i++) {
                let p = jsonResponse['presents'][i];

                // If a present has been unwrapped, update that info
                if (this.presentObjs.get(p['id']).getData('unwrapped') === false && p['unwrapped'] === true) {
                    this.presentObjs.get(p['id']).setData('unwrapped', true);
                }
            }

            // Move presents to be next to the players who now own them
            for (let i = 0; i < jsonResponse['players'].length; i++) {
                let p = jsonResponse['players'][i];

                if (p['presents'].length > 0) {
                    for (let j = 0; j < p['presents'].length; j++) {
                        if (p['presents'][j]['unwrapped']) {
                            let presentId = p['presents'][j]['id'];
                            if (p['id'] == this.myPlayerId) {
                                this.displayPresentInNextPositionForCurrentPlayer(presentId);
                            } else {
                                this.displayPresentInNextPositionForPlayer(p['id'], presentId);
                            }
                        }
                    }
                }
            }

            // If turn has advanced, update text and redraw or remove buttons
            if (this.currentPlayerId !== jsonResponse['current_player_id']) {
                this.currentPlayerId = jsonResponse['current_player_id'];
                this.displayCurrentPlayerTurn(jsonResponse['current_player_name']);
                if (this.myTurn) {
                    this.displayRollDiceButton();
                } else {
                    this.removeTurnButtons();
                }
            }
        }
        setTimeout(() => { this.updatePoll(); }, 1000);
    }

    displayCountdownTimer(seconds: number)
    {
        if (this.timeLeftObj !== null) {
            this.timeLeftObj.destroy();
        }

        let displayText = 'Game Over';
        if (seconds !== 0) {
            let minsLeft = Math.floor(seconds/60)
            let minsLeftString = minsLeft.toString();
            if (minsLeft < 10) {
                minsLeftString = '0' + minsLeftString;
            }
            let secondsLeft = seconds%60;
            let secondsLeftString = secondsLeft.toString();
            if (secondsLeft < 10) {
                secondsLeftString = '0' + secondsLeftString;
            }
            displayText = minsLeftString + ':' + secondsLeftString;
        }

        let timeLeft = this.add.text(
            width/2,
            120,
            displayText,
            {
                fontFamily: 'earlygameboy',
                fontSize: '24px'
            }
        );
        timeLeft.setOrigin(0.5);

        this.timeLeftObj = timeLeft;
    }

    displayCurrentPlayerTurn(currentPlayerName: string)
    {
        if (this.currentPlayerNameObj !== null) {
            this.currentPlayerNameObj.destroy();
        }

        this.currentPlayerNameObj = this.add.text(
            width/2,
            150,
            this.myTurn ? 'Your turn' : currentPlayerName + "'s turn",
            {
                fontFamily: 'earlygameboy',
                fontSize: '24px'
            }
        );
        this.currentPlayerNameObj.setOrigin(0.5);
    }

    displayRollDiceButton()
    {
        this.rollButton = this.add.dom(width/2, height/4).createFromCache('roll-button');
        this.rollButton.addListener('click');
        this.rollButton.on('click', (event) => {
            if (event.target.name === 'submitButton') {
                this.rollDice();
            }
        });
    }

    rollDice()
    {
        this.rollButton.destroy(); // Remove the roll button so we can put the text there instead
        this.rollButton = null;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
        let num = Math.floor(Math.random() * (6)) + 1;
        this.diceObj = this.add.text(
            width/2,
            height/4 - 20,
            num.toString(),
            {
                fontFamily: 'earlygameboy',
                fontSize: '24px'
            }
        );
        if (num % 2 === 0) {
            this.allowedToTakePresent = false;
            this.displayEndTurnButton();
        } else {
            this.allowedToTakePresent = true;
        }
    }

    displayEndTurnButton()
    {
        this.endTurnButton = this.add.dom(width/2, height/4 + 60).createFromCache('end-turn-button');
        this.endTurnButton.addListener('click');
        this.endTurnButton.on('click', (event) => {
            if (event.target.name === 'submitButton') {
                this.endTurn();
            }
        });
    }

    async endTurn()
    {
        clearErrors(this);
        const response = await fetch('/ajax/end-turn', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json; charset=UTF-8'}
        });

        if (!response.ok) {
            let errMsgDetails = 'Unknown error occurred';
            let errResponse = await response.json();
            if (errResponse['error']) {
                errMsgDetails = errResponse['error'];
            }
            displayError(this, 'Something went wrong --\ntry again?', errMsgDetails);
        }
    }

    removeTurnButtons()
    {
        if (this.rollButton !== null) {
            this.rollButton.destroy();
            this.rollButton = null;
        }
        if (this.endTurnButton !== null) {
            this.endTurnButton.destroy();
            this.endTurnButton = null;
        }
        if (this.diceObj !== null) {
            this.diceObj.destroy();
            this.diceObj = null;
        }
    }

    displayPopover(pointer, gameObject)
    {
        let fromText = 'From: ' + gameObject.getData('from-player');
        let descriptionText = 'Description: ?????';
        if (gameObject.getData('unwrapped')) {
            descriptionText = 'Description: ' + gameObject.getData('description');
        }

        const popoverWidth = 200;
        const popoverHeight = 75;
        const popoverPadding = 10;
        const buttonWidthHeight = 10;
        const buttonPadding = 4;

        let startX = pointer.x;
        let startY = pointer.y;
        if (gameObject.getData('side') === 'right') {
            // For presents on the right side of the screen only we want to popover to go to the left of the cursor, not the right
            startX = pointer.x - popoverWidth;
        } else if (gameObject.getData('side') === 'bottom') {
            startY = pointer.y - popoverHeight;
        }

        let popover = this.add.rectangle(startX, startY, popoverWidth, popoverHeight, 0x222222, 0.5);
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

        let buttonX = pointer.x + popoverWidth - buttonWidthHeight - buttonPadding;
        let buttonY = pointer.y + buttonPadding;
        if (gameObject.getData('side') === 'bottom') {
            buttonY = pointer.y - buttonWidthHeight - buttonPadding;
        } else if (gameObject.getData('side') === 'right') {
            buttonX = pointer.x - buttonWidthHeight - buttonPadding;
        }

        let closeButton = this.add.rectangle(
            buttonX,
            buttonY,
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

        // If it's my turn, add a button to take the present
        if (this.myTurn && this.allowedToTakePresent) {
            const takeButtonWidth = popoverWidth/5;

            let takeX = pointer.x + popoverWidth - takeButtonWidth - buttonPadding;
            let takeY = pointer.y + popoverHeight - buttonWidthHeight - buttonPadding;
            if (gameObject.getData('side') === 'right') {
                takeX = pointer.x - takeButtonWidth - buttonPadding;
            }

            let takeButton = this.add.rectangle(
                takeX,
                takeY,
                takeButtonWidth,
                buttonWidthHeight,
                0x222222,
                1
            );
            takeButton.setDisplayOrigin(0, 0);
            let takeButtonTxt = this.add.text(0, 0, 'Take', {fontFamily: 'earlygameboy', fontSize: 8});
            let takeButtonBounds = takeButton.getBounds();
            takeButtonTxt.setPosition(
                takeButton.x + (takeButtonWidth/2) - (takeButtonBounds.width/2),
                takeButton.y + (buttonWidthHeight/2) - (takeButtonBounds.height/2)
            );

            // Add it to the list of things to be destroyed
            this.currentPopoverElements.push(takeButtonTxt);
            this.currentPopoverElements.push(takeButton);

            takeButton.setInteractive();
            takeButton.addListener('pointerdown', () => {
                this.takePresent(gameObject.getData('id'));
            });
        }
    }

    async takePresent(id: number)
    {
        clearErrors(this);
        if (this.presentObjs.get(id).getData('unwrapped')) {
            if (!this.allowedToTakeUnwrappedPresents()) {
                displayError(this, 'Choose another present', 'You must unwrap all presents before swapping presents');
                return;
            }
        }
        let putBody = {
            'present_id': id
        };
        const response = await fetch('/ajax/take-present', {
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
            this.endTurn();
            // Close the popover, which would otherwise still be open
            for (let i = this.currentPopoverElements.length - 1; i >= 0; i--) {
                this.currentPopoverElements[i].destroy();
            }
            this.currentPopoverElements = [];
        }
    }

    /**
     * Players may only start swapping unwrapped presents once all wrapped presents are taken.
     */
    allowedToTakeUnwrappedPresents(): boolean
    {
        let allowed = true;
        this.presentObjs.forEach((value: Phaser.GameObjects.Image, key: number) => {
            if (value.getData('unwrapped') === false) {
                allowed = false;
            }
        });

        return allowed;
    }

    /**
     * For players on the left and right of the screen, display their presents in a 3x6 grid.
     */
    displayPresentInNextPositionForPlayer(playerId: number, presentId: number)
    {
        this.removePresentFromAllOtherGrids(presentId);

        const maxNumPresents = 18; // We have a max of 9 players, and 2 presents per player
        const presentGridWidth = 3;
        const cellWidthHeight = 30;
        const sideBuffer = 75;

        // Find the first empty cell, put the present in it, and get coordinates
        for (let cellNum = 0; cellNum < maxNumPresents; cellNum++) {
            let player = this.playerObjs.get(playerId);
            let grid = player.getData('presents-grid');
            if (grid.has(cellNum)) {
                continue;
            }

            // Set the present in the cell
            grid.set(cellNum, presentId);
            this.playerObjs.get(playerId).setData('presents-grid', grid);

            const rowNum = Math.floor(cellNum/presentGridWidth);
            const colNum = cellNum % presentGridWidth;

            let w;
            let h;
            if (this.playerObjs.get(playerId).getData('side') === 'left') {
                w = sideBuffer + (colNum * cellWidthHeight);
                h = this.playerObjs.get(playerId).getTopRight().y + (rowNum * cellWidthHeight);
            } else {
                w = width - sideBuffer - (colNum * cellWidthHeight);
                h = this.playerObjs.get(playerId).getTopLeft().y + (rowNum * cellWidthHeight);
            }
            this.presentObjs.get(presentId).setPosition(w, h);
            this.presentObjs.get(presentId).setData('side', this.playerObjs.get(playerId).getData('side'));
            break;
        }
    }

    /**
     * For the current player, we display a 3x6 grid along the bottom
     */
    displayPresentInNextPositionForCurrentPlayer(presentId: number)
    {
        this.removePresentFromAllOtherGrids(presentId);
        const startX = 40;
        const startY = height - 30;
        const cellWidthHeight = 30;
        const presentGridWidth = 6;
        const maxNumPresents = 18; // We have a max of 9 players, and 2 presents per player

        for (let cellNum = 0; cellNum < maxNumPresents; cellNum++) {
            if (this.myGrid.has(cellNum)) {
                continue;
            }

            // Set the present in the cell
            this.myGrid.set(cellNum, presentId);

            const rowNum = Math.floor(cellNum/presentGridWidth);
            const colNum = cellNum % presentGridWidth;

            let w = startX + (colNum * cellWidthHeight);
            let h = startY - (rowNum * cellWidthHeight);

            this.presentObjs.get(presentId).setPosition(w, h);
            this.presentObjs.get(presentId).setData('side', 'bottom');
            break;
        }
    }

    removePresentFromAllOtherGrids(presentId: number)
    {
        this.playerObjs.forEach((value: Phaser.GameObjects.Sprite, playerId: number) => {
            let grid = value.getData('presents-grid');
            grid.forEach((value: number, cellNum: number) => {
                if (value === presentId) {
                    grid.delete(cellNum);
                }
            });
            this.playerObjs.get(playerId).setData('presents-grid', grid);
        });

        this.myGrid.forEach((value: number, cellNum: number) => {
            if (value === presentId) {
                this.myGrid.delete(cellNum);

            }
        });
    }
}
