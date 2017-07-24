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
        game.load.audio('titleTheme', 'sound/Recurve_Rainbow.ogg');

        // sounds
        game.load.audio('pop', 'sound/pop2.wav');
        game.load.audio('draw', 'sound/draw2.wav');
        game.load.audio('crit', 'sound/crit1.wav');
        game.load.audio('fire', 'sound/fire.wav');
        game.load.audio('levelup', 'sound/levelup.wav');
        game.load.audio('gameover', 'sound/gameover.wav');
        game.load.audio('textAppear', 'sound/text.wav');
    },
    create: function() {

        game.highScore = 0;
        game.world.borderHeight = 600;

        // disable right-click
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        // load all text
        this.titleText = game.add.text(250, 150, "RAINBOW ARCHERY", {
            font: "40px Unibody-reg",
            fill: "#ffffff",
            align: "center"
        }); 

        this.subtitleText = game.add.text(350, 210, "- by Henry Olson -", {
            font: "22px Unibody-reg",
            fill: "#ffffff",
            align: "left"
        });

        this.startText = game.add.text(325, 450, "Shoot me to start!", {
            font: "25px Unibody-reg",
            fill: "#ffffff",
            align: "left"
        });

        this.titleText.alpha = 0.1;
        this.subtitleText.alpha = 0.1;
        this.startText.alpha = 0.1;

        this.rainbow_colors = ['#ff0000', '#ff5555', '#ffaa55',
                               '#ffff55', '#aaff55', '#00ff55',
                               '#00aaaa', '#00aaff', '#0000ff',
                               '#5500ff', '#aa00ff', '#ff00ff'];
        this.rainbow_idx = 0;
        this.time_since_update = game.time.now;

        // sounds for title
        draw = game.add.audio('draw');
        fire = game.add.audio('fire');
        crit = game.add.audio('crit');

        // title music
        titleTheme = game.add.audio('titleTheme');
        titleTheme.addMarker('intro', 0, 34.914);
        titleTheme.addMarker('loop', 34.914, 34.904, 1, true);
        titleTheme.play('intro');

        //play the loop only after the intro
        titleTheme.onStop.add(function() {
            console.log(titleTheme.currentMarker);
            if (titleTheme.currentMarker !== 'loop') {
                titleTheme.play('loop');
            }
        }, this);

        player = game.add.sprite(0, (game.world.borderHeight / 2), 'bow', 0);
        player.ready = false;
        player.shoot = shoot;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.physics.arcade.enable(player);
        game.physics.arcade.enable(this.startText);

        drawAnim = player.animations.add('draw', [0, 1, 2, 3, 4, 5, 6, 7], 30, false);
        drawAnim.onComplete.add(bowDrawn, this);
        player.animations.add('shoot', [11, 12, 13], 30, false);

        shots = game.add.group();
        shots.enableBody = true;
        shots.physicsBodyType = Phaser.Physics.ARCADE;

        game.input.activePointer.leftButton.onDown.add(function() {
            player.animations.play('draw');
            draw.play();
        }, this);

        game.input.activePointer.leftButton.onUp.add(function() {
            player.animations.play('shoot');
            if (player.ready) {
                player.shoot(shots);      
            }
            
        }, this);

        this.starting = false;
    },

    update: function() {
        updatePosition(player);

        // check to see if we can start the game
         game.physics.arcade.overlap(shots, this.startText, startGame, null, this);


        // cycle through rainbow colors
        if (game.time.now - this.time_since_update > 200) {
            for (let i = 0; i < 7; i++) {
                this.titleText.addColor(this.rainbow_colors[(this.rainbow_idx + i) % this.rainbow_colors.length], i);
            }
            this.titleText.addColor('#ffffff', 7);

            this.time_since_update = game.time.now;
            this.rainbow_idx = (this.rainbow_idx + 1);
        }

        game.add.tween(this.titleText).to( { alpha: 1}, 500, "Linear", true);
        game.add.tween(this.subtitleText).to( { alpha: 1}, 500, "Linear", true);
        game.add.tween(this.startText).to( { alpha: 1}, 500, "Linear", true);
    }
};

function startGame(startText, shot) {
    if (!this.starting) {
        this.starting = true;
        crit.play();
        titleTheme.fadeOut(1000);

        shot.body.velocity.x = 200;
        startText.body.velocity.x = 50;

        setTimeout(function() {
            titleTheme.pause();
        }, 1000);

        setTimeout(function() {
            shot.destroy();
            game.stage.backgroundColor = 0x000000;
            game.state.start('play');
        }, 1500);
    }
    game.stage.backgroundColor = this.rainbow_colors[this.rainbow_idx % this.rainbow_colors.length];
};