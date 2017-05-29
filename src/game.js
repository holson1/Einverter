// globals
var game = new Phaser.Game(1000, 655, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
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

    // music
    game.load.audio('mainTheme', 'sound/Alpha_Inverter.ogg')

    // sounds
    game.load.audio('pop', 'sound/pop2.wav');
    game.load.audio('draw', 'sound/draw2.wav');
    game.load.audio('crit', 'sound/crit1.wav');
    game.load.audio('fire', 'sound/fire.wav');
}

function create() {

    // disable right-click
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    // SCORE PANEL
    game.world.borderHeight = 600;

    // draw the score area
    scoreboard = game.add.sprite(0, 600, 'scoreboard', 0);
    scoreboard.animations.add('flush', [1, 2, 3, 4, 5, 6, 7, 0], 30, false);
    scoreboard.text = game.add.text(100, 610, "000000", {
        font: "22px Courier",
        fill: "#ffffff",
        align: "left"
    });
    game.score = 0;
    game.r = game.g = game.b = 1000;
    //scoreboard.text.anchor.setTo(0.5, 0.5);

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

    pop = game.add.audio('pop');
    crit = game.add.audio('crit');
    draw = game.add.audio('draw');
    fire = game.add.audio('fire');

    // music
    mainTheme = game.add.audio('mainTheme')
    mainTheme.addMarker('intro', 0, 40.425);
    mainTheme.addMarker('loop', 40.425, 103.575, 1, true);

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

            // TODO: make these constants
            game.r -= 100;
            game.g -= 100;
            game.b -= 100;
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

    // ensures the score board stays at the top
    game.world.bringToTop(scoreboard);

    // update the score
    scoreboard.text.setText(game.score + " r:" + game.r + " g:" + game.g + " b:" + game.b);
    
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

function invert() {
    game.invert = (game.invert ? false : true);
    game.stage.backgroundColor = (game.stage.backgroundColor == 0 ? '#FFFFFF' : '#000000');
    player.tint = (player.tint == '0x00' ? '0xffffff' : '0x00');
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

        if (shot.critical) {
            game.score += 1;
        }
        else {
            // test stripping rgb values
            var hexStr = orb.tint.toString(16);

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

function cleanupAfterAnimation(sprite, animation) {
    sprite.kill();
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
    shot.events.onOutOfBounds.add(shot.kill, this);
}

// spawn a new random orb
// orbs.spawnOrb
function spawnOrb() {

    var orb = this.create(400 + (Math.random() * 600), game.world.borderHeight, 'orb', 0);
    orb.body.setCircle(24, 23, 22);
    var rand_num = Math.random();
    // orb.body.acceleration.x = (rand_num - 0.5) * 2;
    orb.body.velocity.y = Math.min(rand_num * -150, -30);
    orb.tint = Math.floor(rand_num * 0xffffff);
    orb.alpha = Math.max(rand_num, 0.4);
    var anim = orb.animations.add('pop', [1, 2, 3, 4, 5], 30, false);
    anim.onComplete.add(cleanupAfterAnimation, this);
    
    this.spawnClock = 30;
}