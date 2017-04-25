var game = new Phaser.Game(1000, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var player;

function preload() {

    game.load.spritesheet('bow', 'img/bow_sheet.png', 192, 96, 14);
    game.load.spritesheet('orb', 'img/orb_sheet.png', 96, 96, 6);
    game.load.image('shot', 'img/shot_small.png');
    game.load.image('particle', 'img/particle.png');
}

function create() {

    // disable right-click
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    // The player and its settings
    player = game.add.sprite(0, (game.world.height / 2), 'bow', 0);
    player.ready = false;

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);


    //  animations
    drawAnim = player.animations.add('draw', [0, 1, 2, 3, 4, 5, 6, 7], 30, false);
    drawAnim.onComplete.add(bowDrawn, this);
    player.animations.add('shoot', [11, 12, 13], 30, false);

    //game.stage.backgroundColor = "#000000";
    game.invert = false;

    /* cool colors
    0xff3355 - pinkish red
    0x00ffcc - tealish green
    */

    // set up shots
    shots = game.add.group();
    shots.enableBody = true;
    shots.physicsBodyType = Phaser.Physics.ARCADE;

    // set up orbs 
    orbs = game.add.group();
    orbs.enableBody = true;
    orbs.physicsBodyType = Phaser.Physics.ARCADE;
    
    // for (var i=0; i<20; i++) {
    //     var orb = orbs.create(500 + (Math.random() * 400), game.world.randomY, 'orb', 0);
    //     orb.body.setCircle(24, 23, 22);
    //     var anim = orb.animations.add('pop', [1, 2, 3, 4, 5], 30, false);
    //     anim.onComplete.add(animationStopped, this);
    // }
    
    // particles
    emitter = game.add.emitter(0, 0, 100);

    emitter.makeParticles('particle');

    // game clock
    clock = 5;

    /*
    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    */
    
    // left mouse button pressed
    game.input.activePointer.leftButton.onDown.add(function() {
        //console.log("mouse pressed");
        player.animations.play('draw');
    }, this);

    // left mouse button released
    // this can be put into a shoot function
    game.input.activePointer.leftButton.onUp.add(function() {
        player.animations.play('shoot');
        //console.log("mouse released");

        if (player.ready) {
            // draw the shot - ideally when the animation ends
            var y = (player.height / 2) + player.y - 4;

            var shot = shots.create(0, y, 'shot', 0);
            shot.active = true;
            shot.tint = game.invert ? "0x00" : "0xffffff";
            shot.critical = false;

            shot.body.velocity.x = 7000;
            shot.checkWorldBounds = true;
            shot.events.onOutOfBounds.add(shot.kill, this);

            player.ready = false;
        }
        
    }, this);

    // right mouse button released inverts
    game.input.activePointer.rightButton.onUp.add(invert, this);
}

function update() {

    var pos = game.input.activePointer.position;

    // bottom bound
    if (pos.y > game.world.height - (player.height / 2)) {
        player.y = game.world.height - player.height;
    }
    // top bound
    else if (pos.y < player.height / 2) {
        player.y = 0;
    }
    // otherwise
    else {
        player.y = pos.y - (player.height / 2);
    }
        
    
    // use this to ensure we charge the bow fully
    if (game.input.activePointer.leftButton.isDown) {
        //player.animations.play('draw');
    }

    // check to see if an arrow collides with an orb
    game.physics.arcade.overlap(shots, orbs, collisionHandler, null, this);


    // create an orb
    // make this a function
    if (clock == 0) {
        var orb = orbs.create(350 + (Math.random() * 650), game.world.height, 'orb', 0);
        orb.body.setCircle(24, 23, 22);
        var rand_num = Math.random();
        orb.body.velocity.y = Math.min(rand_num * 150 * -1, -20);
        orb.tint = rand_num * 0xffffff;
        orb.alpha = Math.max(rand_num, 0.3);
        var anim = orb.animations.add('pop', [1, 2, 3, 4, 5], 30, false);
        anim.onComplete.add(animationStopped, this);
        
        clock = 20;
    }
    else {
        clock--;
    }

    /*
    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }
    */

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
            setTimeout(function() {
                    shot.kill();
                    orb.animations.play('pop');
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
            orb.animations.play('pop');
        }
    }
}

function animationStopped(sprite, animation) {
    sprite.kill();
}

function bowDrawn(player, animation) {
    player.ready = true;
}