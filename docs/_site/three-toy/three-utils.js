import * as THREE from "three";

/**
 * Boilerplate to create a THREE.js scene
 */
export function makeScene({
	animate: animationFn,
	camera: cameraConfig = {},
	container = document.body,
	controls: controlsConstructor,
} = {}) {
	// create a scene
	const scene = new THREE.Scene();

	// create a camera
	const rect = container.getBoundingClientRect();
	const camera = new THREE.PerspectiveCamera(
		75,
		rect.width / rect.height,
		0.1,
		1000,
	);

	if (cameraConfig.up) {
		camera.up.set(...cameraConfig.up);
	}
	if (cameraConfig.position) {
		camera.position.set(...cameraConfig.position);
	}

	// create a renderer and add it to the document
	const renderer = new THREE.WebGLRenderer({
		alpha: true, // makes background transparent (so we can set it using css); otherwise black
		antialias: true, // smooths the graphics out
	});

	renderer.setSize(rect.width, rect.height);
	container.appendChild(renderer.domElement);

	// controls
	/** @type THREE.Controls */
	let controls;
	if (controlsConstructor) {
		controls = new controlsConstructor(camera, renderer.domElement);
	}

	// handle resizing (of the window)
	window.addEventListener("resize", () => {
		const { height, width } = container.getBoundingClientRect();

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	});

	// animation loop
	function animate() {
		animationFn?.(); // this means "if the user passes and animation function, do this"

		// required if controls.enableDamping or controls.autoRotate are set to true
		controls?.update();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animate);

	// camera helper - custom code by Yuri
	// If I adjust the camera (zoom/rotate) then shift-click, I can recover the new camera coordinates (so that I can copy and paste them into my code, e.g. to change the starting view angle)
	document.body.addEventListener("click", (e) => {
		if (e.shiftKey) { //if shift is held down
			let { x, y, z } = camera.position;
			[x, y, z] = [x, y, z].map((t) => truncate(t)); //the new position, truncated to two decimal places

			// log the camera position
			console.log(`camera position: [${x}, ${y}, ${z}]`);

			// copy to clipboard
			navigator.clipboard.writeText([x, y, z].join(", ")).then(() => {
				console.log("copied camera coords to clipboard!");
			});
		}
	});

	// return values
	return { camera, controls, renderer, scene };
}

/**
 * Truncate a number to 2 decimal digits of precision
 */
export function truncate(x, precision = 2) {
	return parseFloat(x.toFixed(precision));
}

/**
 * Linear interpolation from a to b
 * @param {number} a starting point
 * @param {number} b ending point
 * @param {number} t Progress
 */
export function lerp(a, b, t) {
	return a + t * (b - a);
}
