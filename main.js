/*jslint browser: true*/
/*global makeSimulation, makeBox, makeSphere */

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
        
        box = makeBox({
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
        });
    
    ball.setCollisionCallback(function () {
        document.getElementById('bounce_sound').play();
    });
    
    simulator.addEntity(ball);
    simulator.addEntity(box);
    simulator.setEntityInteractionProperties(ball, box, 0.1, 0.99);
    
    simulator.start();
}());