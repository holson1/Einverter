var gameOverState = {
    create: function() {
        console.log("GAME OVER");

        game.add.text(200, 263, "GAME OVER", {
            font: "25px Unibody-reg",
            fill: "#ffffff",
            align: "left"
        });

        game.add.text(200, 303, "Click to restart", {
            font: "25px Unibody-reg",
            fill: "#ffffff",
            align: "left"
        });
    },

    update: function() {
        if (game.input.activePointer.leftButton.isDown) {
            game.state.start('play');
        };
    }
};