import * as THREE from "three";
import "./style.css";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as dat from "dat.gui";
import gsap from "gsap";

class App {
  constructor() {
    this.init();
  }

  init() {
    let params = {
      envMap: "HDR",
      roughness: 0.0,
      metalness: 1,
      color: 0xffffff,
      spin: () => {
        console.log(this.torusMesh.rotation.y);
        gsap.to(this.torusMesh.rotation, { duration: 1, y: this.torusMesh.rotation.y + Math.PI * 2 });
      },
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 120;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.useLegacyLights = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.update();
    const gui = new dat.GUI();

    const envmap = new RGBELoader().load("./resources/quarry_01_1k.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.NearestFilter;

      this.scene.environment = texture;
      this.scene.background = texture;
    });

    let light = new THREE.DirectionalLight(0x101010);
    light.position.set(0, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;

    this.scene.add(light);
    light = new THREE.AmbientLight(0x101010);
    this.scene.add(light);

    const geometry = new THREE.TorusGeometry(20, 10, 32, 100);
    const geometry1 = new THREE.SphereGeometry(26, 64, 32);
    const geometry2 = new THREE.PlaneGeometry(50, 50, 50, 50);
    const material = new THREE.MeshStandardMaterial({
      color: params.color,
      roughness: 0,
      metalness: 1,
      side: THREE.DoubleSide,
    });
    this.torusMesh = new THREE.Mesh(geometry, material);
    this.SphereMesh = new THREE.Mesh(geometry1, material);
    this.planeMesh = new THREE.Mesh(geometry2, material);
    this.torusMesh.position.set(-100, 0, 0);
    this.planeMesh.position.set(100, 0, 0);
    this.torusMesh.castShadow = true;
    this.scene.add(this.torusMesh, this.SphereMesh, this.planeMesh);

    /**
     * 3D Google Model
     */

    const loader = new GLTFLoader();

    loader.load("./resources/ski_goggle.glb", (gltf) => {
      const model = gltf.scene;
      const modelFolder = gui.addFolder("Model");
      model.scale.set(100, 100, 100);
      // this.scene.add(model);

      modelFolder.add(model.position, "x", -100, 100, 0.01);
      modelFolder.add(model.position, "y", -100, 100, 0.01);
      modelFolder.add(model.position, "z", -100, 100, 0.01);
      modelFolder.add(model, "visible");
    });

    /**
     * Text
     */
    const fontLoader = new FontLoader();
    fontLoader.load("./resources/fonts/helvetiker_regular.typeface.json", (font) => {
      // Material
      const material = new THREE.MeshStandardMaterial({ color: params.color, roughness: 0, metalness: 1 });

      // Text
      const textGeometry = new TextGeometry("TAOSHOKE", {
        font: font,
        size: 10,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 3,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      textGeometry.center();

      const text = new THREE.Mesh(textGeometry, material);
      text.position.set(0, 50, 0);
      this.scene.add(text);

      const donutGeometry = new THREE.BoxGeometry(3, 3, 0.5);

      function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      for (let i = 0; i < 100; i++) {
        const donut = new THREE.Mesh(donutGeometry, material);
        donut.position.x = randomInteger(-120, 120);
        donut.position.y = randomInteger(-120, 120);
        donut.position.z = randomInteger(-120, 120);
        donut.rotation.x = randomInteger(-120, 120) * Math.PI;
        donut.rotation.y = randomInteger(-120, 120) * Math.PI;
        // const scale = Math.floor(Math.random() * 20) + 1;
        // donut.scale.set(scale, scale, scale);

        this.scene.add(donut);
      }
    });

    /**
     * Debug UI
     */

    const meshFolder = gui.addFolder("Mesh");
    meshFolder.add(material, "roughness", 0, 1, 0.01);
    meshFolder.add(material, "metalness", 0, 1, 0.01);
    meshFolder.addColor(params, "color").onChange(() => {
      this.torusMesh.material.color.set(params.color);
    });
    meshFolder.add(this.torusMesh.position, "x", -100, 100, 0.01);
    meshFolder.add(this.torusMesh.position, "y", -100, 100, 0.01);
    meshFolder.add(this.torusMesh.position, "z", -100, 100, 0.01);
    meshFolder.add(this.camera.position, "x", -100, 100, 0.01);
    meshFolder.add(this.camera.position, "y", -100, 100, 0.01);
    meshFolder.add(this.camera.position, "z", -100, 100, 0.01);

    meshFolder.add(params, "spin");

    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("keydown", (e) => this.onKeyDown(e));

    this.animate();
  }

  /**
   * Terrain
   */

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}

new App();
