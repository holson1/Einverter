// globals
var game = new Phaser.Game(1000, 605, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var player;
var shots;
var orbs;
var scoreboard;
var graphics;

function preload() {

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
}

function create() {

    // disable right-click
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    game.world.borderHeight = 550;

    // draw the score area
    scoreboard = game.add.sprite(0, 550, 'scoreboard', 0);
    // TODO: make a batteries group
    // battery objects should have a 'defaultColor' property
    batteryRed = game.add.sprite(515, 555, 'battery', 0);
    batteryRed.tint = 0xff0000;
    batteryGreen = game.add.sprite(665, 555, 'battery', 0);
    batteryGreen.tint = 0x00ff00;
    batteryBlue = game.add.sprite(815, 555, 'battery', 0);
    batteryBlue.tint = 0x0000ff;
    scoreboard.animations.add('flush', [1, 2, 3, 4, 5, 6, 7, 0], 30, false);
    scoreboard.text = game.add.text(100, 580, "000000", {
        font: "15px Courier",
        fill: "#ffffff",
        align: "left"
    });

    // some constants that can probably go elsewhere
    game.START_VAL = 1000;
    game.FULL_VAL = 2000;
    game.MAX_VAL = 2300;
    // Initialize the scoring
    game.score = 0;
    game.r = game.g = game.b = game.START_VAL;
    game.level = 1;

    // The player and its settings
    player = game.add.sprite(0, (game.world.borderHeight / 2), 'bow', 0);
    player.ready = false;
    player.shoot = shoot;

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    // player animations
    drawAnim = player.animations.add('draw', [0, 1, 2, 3, 4, 5, 6, 7], 30, false);
    drawAnim.onComplete.add(bowDrawn, this);
    player.animations.add('shoot', [11, 12, 13], 30, false);

    //game.stage.backgroundColor = "#000000";
    game.invert = false;

    // set up shots
    shots = game.add.group();
    shots.enableBody = true;
    shots.physicsBodyType = Phaser.Physics.ARCADE;

    // set up orbs 
    orbs = game.add.group();
    orbs.enableBody = true;
    orbs.physicsBodyType = Phaser.Physics.ARCADE;
    orbs.spawnClock = 30;
    orbs.spawnOrb = spawnOrb;

    // particles
    /*
    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('particle');
    */

    /*
    SOUND REGISTRATION
    */

    // TODO: add a sound manager object here

    pop = game.add.audio('pop');
    crit = game.add.audio('crit');
    draw = game.add.audio('draw');
    fire = game.add.audio('fire');
    levelup = game.add.audio('levelup');


    // music
    mainTheme = game.add.audio('mainTheme')
    mainTheme.addMarker('intro', 0, 40.425);
    mainTheme.addMarker('loop', 40.425, 103.575, 1, true);

    // TODO: allow user to disable music
    mainTheme.play('intro');

    // play the loop only after the intro
    mainTheme.onStop.add(function() {
        if (mainTheme.currentMarker !== 'loop') {
            mainTheme.play('loop');
        }
    }, this);

    
    /*
    EVENT HANDLERS
    */

    // left mouse button pressed
    game.input.activePointer.leftButton.onDown.add(function() {
        //console.log("mouse pressed");
        player.animations.play('draw');
        // this is a sound - could use sound manager obj here
        draw.play();
    }, this);


    // left mouse button released
    game.input.activePointer.leftButton.onUp.add(function() {
        player.animations.play('shoot');
        //console.log("mouse released");

        if (player.ready) {
            player.shoot(shots);

            
        }
        
    }, this);
}

function update() {

    /*
    PLAYER POSITION
    */

    var pos = game.input.activePointer.position;

    // bottom bound
    if (pos.y > game.world.borderHeight - (player.height / 2)) {
        player.y = game.world.borderHeight - player.height;
    }
    // top bound
    else if (pos.y < player.height / 2) {
        player.y = 0;
    }
    // otherwise
    else {
        player.y = pos.y - (player.height / 2);
    }


    // check to see if an arrow collides with an orb
    game.physics.arcade.overlap(shots, orbs, collisionHandler, null, this);


    // create an orb
    if (orbs.spawnClock == 0) {
        orbs.spawnOrb();
    }
    else {
        orbs.spawnClock--;
    }

    // update the batteries with their new levels
    // TODO: run these checks only when a shot is fired or a bubble leaves the screen

    // TODO: batteries should be in a group and game.r, game.g, etc. should be in an array called game.colors[]
    // This will make it much easier to programmatically update the batteries
    var scaleConstant = game.FULL_VAL / 9;
    if (game.r >= game.FULL_VAL) {
        batteryRed.frame = 8;
        batteryRed.tint = (batteryRed.tint == '0xffffff' ? '0xff0000' : '0xffffff');
    }
    else {
        var frameR = Math.floor(game.r / scaleConstant);
        batteryRed.frame = frameR;
    }
    if (game.g >= game.FULL_VAL) {
        batteryGreen.frame = 8;
        batteryGreen.tint = (batteryGreen.tint == '0xffffff' ? '0x00ff00' : '0xffffff');
    }
    else {
        var frameG = Math.floor(game.g / scaleConstant);
        batteryGreen.frame = frameG;
    }
    if (game.b >= game.FULL_VAL) {
        batteryBlue.frame = 8;
        batteryBlue.tint = (batteryBlue.tint == '0xffffff' ? '0x0000ff' : '0xffffff');
    }
    else {
        var frameB = Math.floor(game.b / scaleConstant);
        batteryBlue.frame = frameB;
    }


    // check for level ups
    // TODO: make level up function
    if (game.r >= 2000 && game.g >= 2000 && game.b >= 2000) {
        levelup.play();
        game.level++;
        game.r = game.g = game.b = game.START_VAL;
        batteryRed.tint = '0xff0000';
        batteryGreen.tint = '0x00ff00';
        batteryBlue.tint = '0x0000ff';
    }

    // ensures the score board stays at the top
    game.world.bringToTop(scoreboard);
    game.world.bringToTop(batteryRed);
    game.world.bringToTop(batteryGreen);
    game.world.bringToTop(batteryBlue);
    // update the scoreboard
    // TODO: make this a function
    scoreboard.text.setText(game.score + " lvl: " + game.level + " r:" + game.r + " g:" + game.g + " b:" + game.b);
    
}

// debugging stuff
function render () {
    // enable debug
    
    /*
    game.debug.body(player);

    for (let orb of orbs.children) {
        game.debug.body(orb);
    }
    */
}

function collisionHandler(shot, orb) {
    if (shot.active) {

        // critical hit
        if ((orb.y + (orb.height / 2) - 8 <= shot.y && shot.y <= orb.y + (orb.height / 2)) || shot.critical)  {
            shot.critical = true;
            shot.body.velocity.x = 100;
            orb.body.velocity.x = 50;
            orb.body.velocity.y = 0;
            if (! crit.isPlaying) {
                crit.play();
            }
            game.stage.backgroundColor = orb.tint;

            setTimeout(function() {
                    shot.kill();
                    orb.animations.play('pop');
                    game.stage.backgroundColor = 0x000000;
            }, 400);
        }
        // normal hit
        else {
            shot.active = false;
            orb.body.velocity.y = 0;
            shot.body.velocity.x = 100;
            setTimeout(function() {
                shot.kill();
            }, 10);
            pop.play();
            orb.animations.play('pop');
        }

        scoreboard.animations.play('flush');

        // TODO: make critical add to rgb values properly
        // TODO: implement critical combo system
        if (shot.critical) {
            game.score += 1;
        }
        else {
            // strip rgb values
            var hexStr = ("000000" + (+orb.tint).toString(16)).slice(-6);

            // TODO: make a function to do this
            var rHex = hexStr[0] + hexStr[1];
            var rVal = parseInt("0x" + rHex);
            game.r += rVal;

            var gHex = hexStr[2] + hexStr[3];
            var gVal = parseInt("0x" + gHex);
            game.g += gVal;

            var bHex = hexStr[4] + hexStr[5];
            var bVal = parseInt("0x" + bHex);
            game.b += bVal;

            game.score += 10;
        }
    }
}

function bowDrawn(player, animation) {
    player.ready = true;
}

// handle shooting
// player.shoot
function shoot(shots) {
    
    this.animations.play('shoot');
    //console.log("mouse released");

    if (this.ready) {

        // detract score
        // TODO: make these constants
        // 100 seems balanced
        game.r -= 50;
        game.g -= 50;
        game.b -= 50;

        // draw the shot - ideally when the animation ends
        var y = (this.height / 2) + this.y - 4;
        fire.play();
        createShot(y, shots);
        this.ready = false;
    }
}

// create a new shot
function createShot(y, shots) {
    var shot = shots.create(0, y, 'shot', 0);
    shot.active = true;
    shot.critical = false;
    shot.body.velocity.x = 7000;
    shot.checkWorldBounds = true;
    shot.events.onOutOfBounds.add(destroySprite, this);
}

// spawn a new random orb
// orbs.spawnOrb
function spawnOrb() {

    var orb = this.create(400 + (Math.random() * 540), game.world.borderHeight, 'orb', 0);
    orb.body.setCircle(24, 23, 22);
    var rand_num = Math.random();

    var levelFactor = 20 * game.level;

    // TODO: define these patterns in a JSON file and read them for each level
    // ex:
    // patternIndex = (game.level % num_patterns)
    // values = loadFromJson(pattern=patternIndex)

    // PATTERN 3
    if (game.level % 3 == 0) {
        orb.body.velocity.x = -100;
        orb.body.velocity.y = -255;
        orb.body.acceleration.x = 60;
        this.spawnClock = 10;
    }
    // PATTERN 1
    else if (game.level % 1 == 0) {
        orb.body.velocity.y = Math.min((rand_num * -130) - levelFactor, -30 - levelFactor);
        this.spawnClock = 25;
    }
    
    // scale the orb to a random value
    //var scale = Math.max(rand_num * 1.5, 1);
    //orb.scale.setTo(scale, scale);

    // TODO: set a new random value for color (so color and speed/size aren't tied together)
    orb.tint = Math.floor(rand_num * 0xffffff);
    // maybe here too
    orb.alpha = Math.max(rand_num, 0.4);
    var anim = orb.animations.add('pop', [1, 2, 3, 4, 5], 30, false);
    anim.onComplete.add(destroySprite, this);

    orb.checkWorldBounds = true;
    orb.events.onOutOfBounds.add(destroySprite, this);
}

// standard destroy function
function destroySprite(sprite) {
    sprite.destroy();
}