/*
In this project we're going to setup a 2d 'birds eye' view of a flock of boids.
Don't use any reference code from './partials/bedroom.js' in this project, we're starting from scratch.
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

let renderer;
let scene;
let camera;
let controls;
let world;
let boid = {
    amount: 10,
    speed: 0.01,
    acceleration: 0.001,
    velocity: 0.1,
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    avoid_walls: false,
    show_world: true,
};
let boids = [];

// Set up renderer and camera within a window load event listener
window.addEventListener('load', () => {
    
    init();
    
    init_boids();

    init_gui();
    
    // animate
    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        boids.forEach((boid) => {
            boid.run();
        });
        renderer.render( scene, camera );
    }
    animate();
});


function init () {
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.antialias = true;
    renderer.setPixelRatio(window.devicePixelRatio * 2);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    const fov = 90;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.001;
    const far = 1000.0;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // Place the camera above the scene looking down at the origin
    camera.position.set(0, 10, 0);
    camera.rotation.x = -Math.PI / 2;

    // Add a plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 1024 * 4;
    directionalLight.shadow.mapSize.height = 1024 * 4;
    scene.add(directionalLight);

    // Add a hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);


    // Add a sphere to represent the light
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'blue' });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 1, 0);
    scene.add(sphere);

    // orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    // grid 
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
}

function init_boids () {
    // Create boids
    for (let i = 0; i < boid.amount; i++) {
        const boid = new Boid();
        boid.setWorldSize(10, 10, 10);
        boid.setAvoidWalls(boid.avoid_walls);
        boid.setSpeed(boid.speed);
        boid.setAcceleration(boid.acceleration);
        boid.setVelocity(boid.velocity);
        boid.position.set(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
        boid.position.multiplyScalar(10);
        scene.add(boid);
        boids.push(boid);
    }

    if (boid.show_world) {
        const worldGeometry = new THREE.BoxGeometry(10, 10, 10);
        const worldMaterial = new THREE.MeshBasicMaterial({ color: 0xfff, wireframe: true });
        const world = new THREE.Mesh(worldGeometry, worldMaterial);
        scene.add(world);
    }
}

function init_gui () {
    // gui
    const gui = new dat.GUI();
    gui.add(boid, 'amount', 0, 100).step(1).onChange(() => {
        if (boids.length < boid.amount) {
            for (let i = 0; i < boid.amount; i++) {
                const boid = new Boid();
                boid.setWorldSize(10, 10, 10);
                boid.setAvoidWalls(boid.avoid_walls);
                boid.setSpeed(boid.speed);
                boid.setAcceleration(boid.acceleration);
                boid.setVelocity(boid.velocity);
                boid.position.set(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                );
                boid.position.multiplyScalar(10);
                scene.add(boid);
                boids.push(boid);
            }
        } else {
            for (let i = 0; i < boid.amount; i++) {
                const boid = boids[i];
                scene.remove(boid);
                boids.splice(i, 1);
            }
        }
    });

    gui.add(boid, 'speed', 0, 0.1).step(0.001).onChange(() => {
        boids.forEach((boid) => {
            boid.setSpeed(boid.speed);
        });
    });

    gui.add(boid, 'acceleration', 0, 0.1).step(0.001).onChange(() => {
        boids.forEach((boid) => {
            boid.setAcceleration(boid.acceleration);
        });
    });

    gui.add(boid, 'velocity', 0, 0.1).step(0.001).onChange(() => {
        boids.forEach((boid) => {
            boid.setVelocity(boid.velocity);
        });
    });

    gui.add(boid, 'separation', 0, 5).step(0.1).onChange(() => {
        boids.forEach((boid) => {
            boid.setSeparation(boid.separation);
        });
    });

    gui.add(boid, 'alignment', 0, 5).step(0.1).onChange(() => {
        boids.forEach((boid) => {
            boid.setAlignment(boid.alignment);
        });
    });

    gui.add(boid, 'cohesion', 0, 5).step(0.1).onChange(() => {
        boids.forEach((boid) => {
            boid.setCohesion(boid.cohesion);
        });
    });

    gui.add(boid, 'avoid_walls').onChange(() => {
        boids.forEach((boid) => {
            boid.setAvoidWalls(boid.avoid_walls);
        });
    });

    gui.add(boid, 'show_world').onChange(() => {
        if (boid.show_world) {
            const worldGeometry = new THREE.BoxGeometry(10, 10, 10);
            const worldMaterial = new THREE.MeshBasicMaterial({ color: 0xfff, wireframe: true });
            world = new THREE.Mesh(worldGeometry, worldMaterial);
            scene.add(world);
        } else {
            scene.remove(world);
        }
    });
}

class Boid extends THREE.Mesh {
    constructor () {
        super(
            new THREE.ConeGeometry(0.1, 0.3, 3),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        this.speed = 0.01;
        this.acceleration = 0.001;
        this.velocity = 0.1;
        this.separation = 1.5;
        this.alignment = 1.0;
        this.cohesion = 1.0;
        this.avoid_walls = false;
        this.world = null;
        this.maxSpeed = 0.1;
        this.maxForce = 0.001;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        // this.position = new THREE.Vector3();
        this.separationForce = new THREE.Vector3();
        this.alignmentForce = new THREE.Vector3();
        this.cohesionForce = new THREE.Vector3();
        this.avoidWallsForce = new THREE.Vector3();
        this.avoidWallsDistance = 1;
        this.worldSize = new THREE.Vector3();
        this.setSpeed(this.speed);
        this.setAcceleration(this.acceleration);
        this.setVelocity(this.velocity);
        this.setSeparation(this.separation);
        this.setAlignment(this.alignment);
        this.setCohesion(this.cohesion);
        this.setAvoidWalls(this.avoid_walls);
    }

    setSpeed (speed) {
        this.speed = speed;
        this.maxSpeed = speed;
    }

    setAcceleration (acceleration) {
        this.acceleration = acceleration;
        this.maxForce = acceleration;
    }

    setVelocity (velocity) {
        this.velocity = velocity;
    }

    setSeparation (separation) {
        this.separation = separation;
    }

    setAlignment (alignment) {
        this.alignment = alignment;
    }

    setCohesion (cohesion) {
        this.cohesion = cohesion;
    }

    setAvoidWalls (avoid_walls) {
        this.avoid_walls = avoid_walls;
    }

    setWorldSize (x, y, z) {
        this.worldSize.set(x, y, z);
    }

    setWorld (world) {
        this.world = world;
    }

    setAvoidWallsDistance (avoidWallsDistance) {
        this.avoidWallsDistance = avoidWallsDistance;
    }

    setWorld (world) {
        this.world = world;
    }

    setAvoidWallsDistance (avoidWallsDistance) {
        this.avoidWallsDistance = avoidWallsDistance;
    }

    do_separate (boids) {
        const desiredSeparation = this.separation;
        let count = 0;
        if (boids) {
            boids.forEach((boid) => {
                const distance = this.position.distanceTo(boid.position);
                if (distance > 0 && distance < desiredSeparation) {
                    const diff = new THREE.Vector3();
                    diff.subVectors(this.position, boid.position);
                    diff.normalize();
                    diff.divideScalar(distance);
                    this.separationForce.add(diff);
                    count++;
                }
            });
        }
        if (count > 0) {
            this.separationForce.divideScalar(count);
        }
    }

    do_alignment (boids) {
        const neighborDistance = this.alignment;
        let count = 0;
        if (boids) {
            boids.forEach((boid) => {
                const distance = this.position.distanceTo(boid.position);
                if (distance > 0 && distance < neighborDistance) {
                    this.alignmentForce.add(boid.velocity);
                    count++;
                }
            });
        }
        if (count > 0) {
            this.alignmentForce.divideScalar(count);
            this.alignmentForce.clampLength(0, this.maxForce);
        }
    }

    do_cohesion (boids) {
        const neighborDistance = this.cohesion;
        let count = 0;
        if (boids) {
            boids.forEach((boid) => {
                const distance = this.position.distanceTo(boid.position);
                if (distance > 0 && distance < neighborDistance) {
                    this.cohesionForce.add(boid.position);
                    count++;
                }
            });
        }
        if (count > 0) {
            this.cohesionForce.divideScalar(count);
            this.cohesionForce.sub(this.position);
            this.cohesionForce.clampLength(0, this.maxForce);
        }
    }

    avoidWalls () {
        const distance = this.avoidWallsDistance;
        const steer = new THREE.Vector3();
        if (this.position.x < distance) {
            steer.x = 1;
        } else if (this.position.x > this.worldSize.x - distance) {
            steer.x = -1;
        }
        if (this.position.y < distance) {
            steer.y = 1;
        } else if (this.position.y > this.worldSize.y - distance) {
            steer.y = -1;
        }
        if (this.position.z < distance) {
            steer.z = 1;
        } else if (this.position.z > this.worldSize.z - distance) {
            steer.z = -1;
        }
        steer.multiplyScalar(this.maxSpeed);
        this.avoidWallsForce.add(steer);
    }

    wrap () {
        if (this.position.x < 0) {
            this.position.x += this.worldSize.x;
        }
        if (this.position.x > this.worldSize.x) {
            this.position.x -= this.worldSize.x;
        }
        if (this.position.y < 0) {
            this.position.y += this.worldSize.y;
        }
        if (this.position.y > this.worldSize.y) {
            this.position.y -= this.worldSize.y;
        }
        if (this.position.z < 0) {
            this.position.z += this.worldSize.z;
        }
        if (this.position.z > this.worldSize.z) {
            this.position.z -= this.worldSize.z;
        }
    }

    flock (boids) {
        if (this.world !== null) {
            this.avoidWalls();
        }
        this.do_separate(boids);
        this.do_alignment(boids);
        this.do_cohesion(boids);
        this.acceleration.add(this.separationForce);
        this.acceleration.add(this.alignmentForce);
        this.acceleration.add(this.cohesionForce);
    }

    update () {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0, 0);
        if (this.world !== null) {
            this.wrap();
        }
        this.rotation.y = Math.atan2(-this.velocity.z, this.velocity.x);
        this.rotation.z = Math.asin(this.velocity.y / this.velocity.length());
    }

    run (boids) {
        this.flock(boids);
        this.update();
    }
}