var menuState = {
    preload: function() {

        // images
        game.load.spritesheet('bow', 'img/bow_sheet.png', 192, 96, 14);
        game.load.spritesheet('orb', 'img/orb_sheet.png', 96, 96, 6);
        game.load.image('shot', 'img/shot_small.png');
        game.load.image('particle', 'img/particle.png');
        game.load.spritesheet('scoreboard', 'img/scoreboard-sheet.png', 1000, 50, 8);
        game.load.spritesheet('battery', 'img/battery-sheet.png', 105, 40, 9);

        // music
        game.load.audio('mainTheme', 'sound/Alpha_Inverter.ogg');

        // sounds
        game.load.audio('pop', 'sound/pop2.wav');
        game.load.audio('draw', 'sound/draw2.wav');
        game.load.audio('crit', 'sound/crit1.wav');
        game.load.audio('fire', 'sound/fire.wav');
        game.load.audio('levelup', 'sound/levelup.wav');
        game.load.audio('gameover', 'sound/gameover.wav');
    },
    create: function() {
        console.log("MENU STATE");

        // disable right-click
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        game.add.text(100, 563, "Click to start", {
            font: "25px Unibody-reg",
            fill: "#ffffff",
            align: "left"
        });
    },

    update: function() {
        // click to start the game
        if (game.input.activePointer.leftButton.isDown) {
            console.log("TEST");
            game.state.start('play');
        };
    }
};