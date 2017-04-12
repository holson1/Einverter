var game = new Phaser.Game(1000, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    //game.load.image('bow', 'img/bow.png');
    game.load.spritesheet('bow', 'img/bow_sheet.png', 192, 96, 14);
    game.load.image('shot', 'img/shot.png');
}

var player;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    // The player and its settings
    player = game.add.sprite(0, game.world.height - 150, 'bow', 0);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  animations
    player.animations.add('draw', [0, 1, 2, 3, 4, 5, 6, 7], 30, false);
    player.animations.add('shoot', [11, 12, 13], 30, false);

    /* cool colors
    0xff3355 - pinkish red
    0x00ffcc - tealish green
    */

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
    game.input.activePointer.leftButton.onUp.add(function() {
        //console.log("mouse released");
        player.animations.play('shoot');

        // draw the shot - ideally when the animation ends
        var y = (player.height / 2) + player.y - 4;

        var shot = game.add.sprite(100, y, 'shot', 0);
        //shot.tint = 0xff3355;
        setTimeout(function() {
            shot.destroy();
        }, 50);
        
    }, this);

    // right mouse button released inverts
    game.input.activePointer.rightButton.onUp.add(function() {
        player.tint = 0x00ffcc;
        //game.stage.backgroundColor = "#FFFFFF"
    }, this);
}

function update() {

    //game.physics.arcade.moveToPointer(player, 1000);
    var pos = game.input.activePointer.position;
    player.y = pos.y;
    //if (player.y + player.height <= 590) {
    if (game.input.activePointer.leftButton.isDown) {
        //player.animations.play('draw');
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