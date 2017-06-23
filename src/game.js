// globals
var game = new Phaser.Game(1000, 605, Phaser.AUTO, '');
var player;
var shots;
var orbs;
var batteries;
var scoreboard;
var graphics;

// add game states
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('gameover', gameOverState);

game.state.start('menu');