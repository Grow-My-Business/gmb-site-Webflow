import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import TOON_TONE from '../assets/threeTone.jpg';
import bedroom_model from '../assets/bedroom.glb';
// import HDRI from '../assets/env.exr';

let camera;

async function init() {
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    renderer.antialias = true;
    renderer.setPixelRatio(window.devicePixelRatio * 2);
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    const aspect = window.innerWidth / window.innerHeight;
    const d = 2;
    camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
    camera.position.set( 20, 20, -20 );
    camera.rotation.order = 'YXZ';
    camera.rotation.y = - Math.PI / 4;
    camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );

    const scene = new THREE.Scene();

    let directionalLight;
    let hemiLight;
    let spotLight;

    // // HemiLight
    hemiLight = new THREE.HemisphereLight( 0xffeeb1, 0x080820, 0.5 );
    scene.add( hemiLight );

    // HemiLight
    hemiLight = new THREE.HemisphereLight( 'blue', 'blue', 1 );
    scene.add( hemiLight );

    // Spot Light
    spotLight = new THREE.SpotLight(0xffa95c, 10);
    spotLight.castShadow = true; // Enable shadow casting
    spotLight.shadow.bias = -0.0001; // Adjust the shadow bias (can be adjusted based on your scene)
    spotLight.shadow.mapSize.width = 1024 * 4; // Adjust shadow map width
    spotLight.shadow.mapSize.height = 1024 * 4; // Adjust shadow map height
    spotLight.position.set(1, 3, -1); // Adjust light position
    scene.add(spotLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(10, 10, 10); // Adjust light position
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.001; // Adjust the shadow bias (can be adjusted based on your scene)
    directionalLight.shadow.mapSize.width = 1024 * 4;
    directionalLight.shadow.mapSize.height = 1024 * 4;
    scene.add(directionalLight);

    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.maxPolarAngle = (Math.PI / 2) - 0.2;
    controls.minPolarAngle = 0.1;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.08;
    // Prevent pan
    controls.enablePan = false;
    controls.enableZoom = false;

    // Import Geometry from Blender GLTF
    const gltfLoader = new GLTFLoader();
    // const exrLoader = new EXRLoader();
    let model;
    try {
        const gltf = await loadGLTFModel(gltfLoader, bedroom_model);
        model = gltf.scene.children[0];

        let outlines = [];

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                outlines.push(solidify(child));
            }
        });

        outlines.forEach((outline) => {
            outline.position.set(0.5, -0.8, 0.5);
        });

        model.position.set(0.5, -0.8, 0.5);

        scene.add(model);

        // Animate model to float up and down slightly continuously (ease)
        let model_y = 4;
        let model_y_target = -0.8;
        let model_y_speed = 0.1;

        function animate_model() {
            model_y_speed += (model_y_target - model_y) * 0.01;
            model_y_speed *= 0.9;
            model_y += model_y_speed;
            model.position.y = model_y;
        }

        setInterval(animate_model, 1000 / 60);
    } catch (error) {
        console.error('Error loading GLTF model or texture:', error);
    }

    // function add_toon_torus () {
    //     const tex = new THREE.TextureLoader().load(TOON_TONE);
    //     tex.minFilter = tex.magFilter = THREE.NearestFilter;

    //     // Make model a torus knot
    //     const geometry = new THREE.TorusKnotGeometry( 1, 0.3, 100, 16 );
    //     const material = new THREE.MeshToonMaterial({
    //         color: '#4e62f9',
    //         gradientMap: tex,
    //     });

    //     model = new THREE.Mesh( geometry, material );
    //     model.position.set(0, -0.8, 0);
    //     const outline = solidify(model);
    //     outline.position.set(0, -0.8, 0);
    //     model.castShadow = true;
    //     model.receiveShadow = true;
    //     scene.add( model );
    // }

    // add_toon_torus();

    const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
    const planeMaterial = new THREE.MeshStandardMaterial( { color: 0xAFB6CA } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2.0;
    plane.position.y = -1.8;
    scene.add( plane );

    function solidify (mesh) {
        const thickness = 0.01;
        const geometry = mesh.geometry;
        // Place in the same position as the original
        geometry.applyMatrix4(mesh.matrixWorld);
        let material = new THREE.ShaderMaterial({
            vertexShader: /* glsl */`
                void main() {
                    vec3 newPosition = position + normal * ${thickness};
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
                }
            `,
            fragmentShader: /* glsl */`
                void main()  {
                    gl_FragColor = vec4(0, 0, 0, 1);
                }
            `,

            side: THREE.BackSide,
        });

        const outline = new THREE.Mesh(geometry, material);
        // outline.scale.multiplyScalar(1.1);
        scene.add(outline);
        return outline;
    }

    // animate
    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );
        // composer.render();
    }
    animate();
}

async function loadGLTFModel(loader, modelUrl) {
    return new Promise((resolve, reject) => {
        loader.load(
            modelUrl,
            (gltf) => resolve(gltf),
            undefined,
            reject
        );
    });
}

async function loadTex(loader, texUrl) {
    return new Promise((resolve, reject) => {
        loader.load(
            texUrl,
            (tex) => resolve(tex),
            undefined,
            reject
        );
    });
}

// Rest of your functions...

window.addEventListener('DOMContentLoaded', init, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}