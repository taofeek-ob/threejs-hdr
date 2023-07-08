import * as THREE from "three";
import "./style.css";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { DeviceOrientationControls } from "./DeviceOrientation.js";

class App {
  constructor() {
    this.init();
  }

  init() {
    let params = {
      envMap: "HDR",
      roughness: 0.0,
      metalness: 1,
      exposure: 1.0,
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

    const geometry = new THREE.SphereGeometry(26, 64, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: params.roughness,
      metalness: params.metalness,
      envMap: envmap,
    });
    this.torusMesh = new THREE.Mesh(geometry, material);
    this.torusMesh.position.set(0, 0, 0);
    this.torusMesh.castShadow = true;
    // this.torusMesh.position.set(0, 0, 0);

    this.scene.add(this.torusMesh);

    const gui = new GUI();

    gui.add(params, "roughness", 0, 1, 0.01).onChange(() => {
      this.torusMesh.material.roughness = params.roughness;
    });
    gui.add(params, "metalness", 0, 1, 0.01).onChange((value) => {
      this.torusMesh.material.metalness = Number(value);
    });
    gui.add(params, "exposure", 0, 2, 0.01);

    gui.open();

    window.addEventListener("resize", () => this.onWindowResize());

    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.torusMesh.rotation.x += 0.01;
    this.torusMesh.rotation.y += 0.01;

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}

new App();
