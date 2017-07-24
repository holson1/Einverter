var gameOverState = {
    create: function() {
        var textAppear = game.add.audio('textAppear');

        game.add.text(320, 100, "GAME OVER", {
            font: "48px Unibody-reg",
            fill: "#ffffff",
            align: "center"
        });

        setTimeout(function() {
            var scoreLabel = game.add.text(0, 0, "your score", {
                font: "25px Unibody-reg",
                fill: "#ffffff",
                boundsAlignH: "center"
            });
            scoreLabel.setTextBounds(0, 220, game.width, 200);
            textAppear.play();
        }, 200);
        
        setTimeout(function() {
            var scoreText = game.add.text(0, 0, game.score, {
                font: "40px Unibody-reg",
                fill: "#ffffff",
                boundsAlignH: "center"
            });
            scoreText.setTextBounds(0, 250, game.width, 200);
            textAppear.play();
        }, 400);
        
        setTimeout(function() {
            var highScoreLabel = game.add.text(0, 0, "high score", {
                font: "25px Unibody-reg",
                fill: "#ffffff",
                boundsAlignH: "center"
            });
            highScoreLabel.setTextBounds(0, 320, game.width, 200);
            textAppear.play();
        }, 600);

        setTimeout(function() {
            var highScoreText = game.add.text(0, 0, game.highScore, {
                font: "40px Unibody-reg",
                fill: "#ffffff",
                boundsAlignH: "center"
            });
            highScoreText.setTextBounds(0, 350, game.width, 200);
            textAppear.play();
        }, 800);
        
        setTimeout(function() {
            var restartText = game.add.text(0, 0, "Click to restart", {
                font: "25px Unibody-reg",
                fill: "#ffffff",
                boundsAlignH: "center"
            });
            restartText.setTextBounds(0, 480, game.width, 200);
            textAppear.play();

            game.input.activePointer.leftButton.onDown.add(function() {
                game.input.activePointer.leftButton.onDown.removeAll();
                game.state.start('play');
            }, this);
        }, 1000);
    },

    update: function() {
    }
};