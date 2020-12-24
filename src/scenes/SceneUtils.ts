import 'phaser';
import { width, height } from "./../globals";

export function displayBanner(scene: Phaser.Scene)
{
    // Top text
    let gameNameHeader = scene.add.text(
        width/2,
        32,
        'Christmas gift swap:\nCOVID sucks ass edition',
        { fontFamily: 'earlygameboy' }
    );
    gameNameHeader.setOrigin(0.5);

    // Create a lil banner at the top of candy canes and stockings -- each is 24px wide
    let bannerStartX = 24;
    const bannerStep = 48;
    for (let i = 0; i < 10; i++) {
        let img = 'candycane';
        if (i % 2 === 0) {
            img = 'stocking';
        }
        scene.add.image(bannerStartX, 80, img);
        bannerStartX += bannerStep;
    }
}

export function displayName(scene: Phaser.Scene, name: string)
{
    let displayedName = scene.add.text(
        width,
        15,
        name,
        {
            fontFamily: 'earlygameboy',
            fontSize: '10px'
        }
    );
    displayedName.setOrigin(1);
}

export function displayCharacter(scene: Phaser.Scene, key: string)
{
    let displayedCharacter = scene.add.sprite(15, height - 15, key);
    displayedCharacter.setOrigin(0);
}

export function displayError(scene, message: string, details: string)
{
    let errorMsg = scene.add.text(
        width/2,
        height-100,
        message,
        {
            fontFamily: 'earlygameboy',
            fontSize: '18px',
            color: '#ab263d'
        }
    );
    errorMsg.setOrigin(0.5);

    // Strip out the punctuation that looks kinda messy in this font
    let formattedDetails = details.replace(/[\/#!$%\^&\*{}\[\]=\-_`~()]/g, '')
    let detailsMsg = scene.add.text(
        width/2,
        height-50,
        formattedDetails,
        {
            fontFamily: 'earlygameboy',
            fontSize: '8px',
            color: '#ab263d'
        }
    );
    detailsMsg.setOrigin(0.5);

    scene.errorMessages.push(errorMsg);
    scene.errorMessages.push(detailsMsg);
}

export function clearErrors(scene)
{
    for (let i = scene.errorMessages.length - 1; i >= 0; i--) {
        scene.errorMessages[i].destroy();
    }
    scene.errorMessages = [];
}
