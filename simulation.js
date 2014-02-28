/*global THREE, requestAnimationFrame, CANNON, document, window */

var makeEntity = function (spec, my) {
    "use strict";
    my = my || {};
    var that = {};
    
    // protected members
    my.position = {
        x: (spec.position && spec.position.x) || 0,
        y: (spec.position && spec.position.y) || 0,
        z: (spec.position && spec.position.z) || 0
    };
    my.mass = spec.mass || 0;
    my.color = spec.color || 0xFFFFFF;
    my.name = spec.name || "(no name)";
    my.receiveShadow = spec.receiveShadow;
    my.castShadow = spec.castShadow;
    
    // stuff to be set by children
    my.geometry = null;
    my.shape = null;
    
    that.init = function (simulator) {
        that.mesh = new THREE.Mesh(
            my.geometry,
            new THREE.MeshLambertMaterial({color: my.color})
        );
        
        that.mesh.position.x = my.position.x;
        that.mesh.position.y = my.position.y;
        that.mesh.position.z = my.position.z;
        
        that.mesh.receiveShadow = my.receiveShadow;
        that.mesh.castShadow = my.castShadow;
        
        that.physicalMaterial = new CANNON.Material(my.name);
        
        that.body = new CANNON.RigidBody(
            my.mass,
            my.shape,
            that.physicalMaterial
        );

        that.body.position.set(
            my.position.x,
            my.position.y,
            my.position.z
        );
    };
    
    that.setCollisionCallback = function (f) {
        that.body.addEventListener("collide", function (e) {
            f(e);
        });
    };
    
    return that;
};

var makeSphere = function (spec, my) {
    "use strict";
    my = my || {};
    var that = makeEntity(spec, my);
    
    my.radius = spec.radius;
    my.geometry = new THREE.SphereGeometry(my.radius, 16, 16);
    my.shape = new CANNON.Sphere(my.radius);
    
    that.init();
    
    return that;
};

var makeBox = function (spec, my) {
    "use strict";
    my = my || {};
    var that = makeEntity(spec, my);
    
    my.dimension = {
        width: (spec.dimension && spec.dimension.width) || 0,
        height: (spec.dimension && spec.dimension.height) || 0,
        depth: (spec.dimension && spec.dimension.depth) || 0
    };
    my.geometry = new THREE.CubeGeometry(
        my.dimension.width,
        my.dimension.height,
        my.dimension.depth
    );
    my.shape = new CANNON.Box(new CANNON.Vec3(
        my.dimension.width,
        my.dimension.height,
        my.dimension.depth
    ));
    
    that.init();
    
    return that;
};

var makeSimulation = function (spec) {
    "use strict";

    var that = {},
        
        camera,
        spotLight,
        scene,
        renderer,
        controls,
        
        world,
        
        entities = [];
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
        
    camera.position.x = 100;
    camera.position.y = 50;
    camera.position.z = 200;
    
    scene = new THREE.Scene();
        
    // create a point light
    spotLight = new THREE.SpotLight(0xFFFFFF);
    
    spotLight.position.x = 100;
    spotLight.position.y = 200;
    spotLight.position.z = 200;
    spotLight.castShadow = true;
    
    scene.add(spotLight);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(new THREE.Color(0xeeeeee), 1);
    
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0, 0, 0);
    
    document.body.appendChild(renderer.domElement);
    
    world = new CANNON.World();
    world.gravity.set(0, -19.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    
    that.setEntityInteractionProperties = function (
        entity1,
        entity2,
        friction,
        restitution
    ) {
        world.addContactMaterial(new CANNON.ContactMaterial(
            entity1.physicalMaterial,
            entity2.physicalMaterial,
            friction,
            restitution
        ));
    };
    
    that.addEntity = function (e) {
        scene.add(e.mesh);
        world.add(e.body);
        entities.push(e);
    };
    
    that.start = function () {
        (function animate() {
            requestAnimationFrame(animate);
            
            world.step(1.0 / 60.0);
            
            entities.forEach(function (e) {
                e.body.position.copy(e.mesh.position);
                e.body.quaternion.copy(e.mesh.quaternion);
            });
            
            controls.update();
            renderer.render(scene, camera);
        }());
    };
    
    return that;
};