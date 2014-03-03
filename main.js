/*jslint browser: true*/
/*global THREE, requestAnimationFrame, makeSimulation, makeBox, makeSphere */

(function () {
    "use strict";
    var simulator = makeSimulation(),
        
        ball = makeSphere({
            castShadow: true,
            radius: 30,
            position: {
                x: 0,
                y: 100,
                z: 0
            },
            mass: 5
        }),
        
        paddle = makeBox({
            receiveShadow: true,
            dimension: {
                width: 150,
                height: 3,
                depth: 150
            },
            position: {
                x: 0,
                y: -50,
                z: 0
            }
        }),

        floor = makeBox({
            receiveShadow: true,
            dimension: {
                width: 500,
                height: 3,
                depth: 500
            },
            position: {
                x: 0,
                y: -100,
                z: 0
            }
        });

    ball.setCollisionCallback(function () {
        document.getElementById('bounce_sound').play();
    });
    
    simulator.addEntities([ball, paddle, floor]);
    simulator.setEntityInteractionProperties(ball, paddle, 0.1, 0.99);
    simulator.setEntityInteractionProperties(ball, floor, 0.1, 0.99);

    document.addEventListener("keydown", function keyDown(e) {
        var key = String.fromCharCode(e.which);

        switch (key) {
            case "W":
                paddle.translate(0, 0, -20);
                break;
            case "A":
                paddle.translate(-20, 0, 0);
                break;
            case "S":
                paddle.translate(0, 0, 20);
                break;
            case "D":
                paddle.translate(20, 0, 0);
                break;
        }
    }, false);
    
    simulator.start();
}());
