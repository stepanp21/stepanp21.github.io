import * as THREE from "three"; // load THREE.js

// OrbitControls gives you Desmos-style rotation; there are other possibilitie like "arc ball"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // load certain add-ons

import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

import { makeScene } from "./three-utils.js"; // boilerplate stuff is in a separate file

// create scene
// can right click and "go to definition" of any function to see where it's defined
const { scene } = makeScene({
  camera: {
    position: [6.12, 3.59, 5.43],
    up: [0, 0, 1], // math convention - otherwise y is up
  },
  container: document.getElementById("container"),
  controls: OrbitControls,
});

// add lights
const ambientLight = new THREE.AmbientLight(undefined, 0.1);
scene.add(ambientLight);

const pointLights = [
  { position: [0, 5, 5], intensity: Math.PI, decay: 0 },
  { position: [0, 0, -2], intensity: Math.PI },
];

for (const config of pointLights) {
  const pointLight = new THREE.PointLight(
    config.color,
    config.intensity,
    config.distance,
    config.decay,
  );
  pointLight.position.set(...config.position);
  scene.add(pointLight);
}

// axes helper
scene.add(new THREE.AxesHelper(5));

let geometry, material; // lets geometry and material be variables that can be reassigned (without const)

const fn = (x, y) => Math.cos(2 * x) * Math.sin(y) + 1

// parametric surface
geometry = new ParametricGeometry((u, v, target) =>
// => is syntax for an anonymous function; same as writing function(u,v,target)
// Defaults to a unit square parameter domain
{
  const x = 2 * Math.PI * u; // (can also use Yuri's helper function lerp as lerp(0,2*Math.PI,u)
  const y = 5 * v // (or lerp(0,5,v))
  target.set(x, y, fn(x, y))
}, 32, 32); // mesh in u and v

//also try "Phong" or "Normal"
material = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5
});
const surface = new THREE.Mesh(geometry, material);
scene.add(surface);

let input;
// input point
// it's common practice to reuse the variable names "geometry" and "material"
geometry = new THREE.SphereGeometry(0.1, 32, 32);
material = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide
});
input = new THREE.Mesh(geometry, material);
scene.add(input);

let output;
// output point
geometry = new THREE.SphereGeometry(0.1, 32, 32);
material = new THREE.MeshPhongMaterial({
  color: 0x0000ff,
  side: THREE.DoubleSide
});
output = new THREE.Mesh(geometry, material);
setOutputPosition();
scene.add(output);

// step size for moving the point
const step = 0.1;

// set output position
function setOutputPosition() {
  output.position.set(
    input.position.x,
    input.position.y,
    fn(input.position.x,input.position.y)
  )
}

// recognize arrow key stroks
document.body.addEventListener("keydown", (e) => 
  {
    console.log(e.key);

    switch (e.key) {
      case "ArrowLeft":
        input.position.setX(input.position.x-step)
        break; // include this line or else it will run the next case as well
      case "ArrowRight":
        input.position.setX(input.position.x+step)
        break;
      case "ArrowUp":
        input.position.setY(input.position.y+step)
        break;
      case "ArrowDown":
        input.position.setY(input.position.y-step)
        break;
      case "?":
        e.preventDefault(); // stops any default things that should happen
        document.getElementById("help").classList.toggle("hidden");
        break;
    }
    setOutputPosition();
  }
);