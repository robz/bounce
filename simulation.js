/*global THREE, requestAnimationFrame, CANNON, document, window */

var makeEntity = function (spec, my) {
    "use strict";
    my = my || {};
    var that = {};
    
    // protected members
    my.startingPosition = {
        x: (spec.position && spec.position.x) || 0,
        y: (spec.position && spec.position.y) || 0,
        z: (spec.position && spec.position.z) || 0
    };
    my.startingQuaterion = {
        x: (spec.quaterion && spec.quaterion.x) || 0,
        y: (spec.quaterion && spec.quaterion.y) || 0,
        z: (spec.quaterion && spec.quaterion.z) || 0,
        w: (spec.quaterion && spec.quaterion.w) || 0
    };
    my.mass = spec.mass || 0;
    my.color = spec.color || 0xFFFFFF;
    my.name = spec.name || "(no name)";
    my.receiveShadow = spec.receiveShadow;
    my.castShadow = spec.castShadow;
    
    // stuff to be set by children
    my.geometry = null;
    my.shape = null;
    
    that.init = function () {
        that.mesh = new THREE.Mesh(
            my.geometry,
            new THREE.MeshLambertMaterial({color: my.color})
        );
        
        that.mesh.receiveShadow = my.receiveShadow;
        that.mesh.castShadow = my.castShadow;
        
        that.physicalMaterial = new CANNON.Material(my.name);
        
        that.body = new CANNON.RigidBody(
            my.mass,
            my.shape,
            that.physicalMaterial
        );

        that.setPose(my.startingPosition, my.startingQuaterion);
    };
    
    that.setCollisionCallback = function (f) {
        that.body.addEventListener("collide", function (e) {
            f(e);
        });
    };

    that.setPose = function (position, quaternion) {
        that.body.position.set(
            position.x,
            position.y,
            position.z
        );

        that.body.position.copy(that.mesh.position);
        
        if (quaternion) {
            that.body.quaternion.set(
                quaternion.x,
                quaternion.y,
                quaternion.z,
                quaternion.w
            );

            that.body.quaternion.copy(that.mesh.quaternion);
        }
    };

    that.translate = function (dx, dy, dz) {
        that.setPose({
            x: that.body.position.x + dx,
            y: that.body.position.y + dy,
            z: that.body.position.z + dz
        }, null);
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
        my.dimension.width/2,
        my.dimension.height/2,
        my.dimension.depth/2
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
        45,
        window.innerWidth / window.innerHeight,
        100,
        10000
    );
        
    camera.position.x = 200;
    camera.position.y = 40;
    camera.position.z = 200;
    
    scene = new THREE.Scene();
        
    // create a point light
    spotLight = new THREE.DirectionalLight(0xFFFFFF);
    
    spotLight.position.x = 100;
    spotLight.position.y = 300;
    spotLight.position.z = 200;
    spotLight.castShadow = true;
    
    scene.add(spotLight);
   
    // add subtle blue ambient lighting
      var ambientLight = new THREE.AmbientLight(0x111111);
      scene.add(ambientLight);
      
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(new THREE.Color(0xeeeeee), 1);
    
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0, 0, 0);
    
    document.body.appendChild(renderer.domElement);
    
    world = new CANNON.World();
    world.gravity.set(0, -100, 0);
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
    
    that.addEntities = function (ents) {
        ents.forEach(function (e) {
            scene.add(e.mesh);
            world.add(e.body);
            entities.push(e);
        });
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
