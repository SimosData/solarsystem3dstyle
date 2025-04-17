import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let planet_sun_label;
// Add these variables for hover functionality
let raycaster, mouse, hoveredObject;
// Add variables for sun effects
let sunParticles, sunClock;

let mercury_orbit_radius = 50
let venus_orbit_radius = 60
let earth_orbit_radius = 70
let mars_orbit_radius = 80
let jupiter_orbit_radius = 100
let saturn_orbit_radius = 120
let uranus_orbit_radius = 140
let neptune_orbit_radius = 160

let mercury_revolution_speed = 2
let venus_revolution_speed = 1.5
let earth_revolution_speed = 1
let mars_revolution_speed = 0.8
let jupiter_revolution_speed = 0.7
let saturn_revolution_speed = 0.6
let uranus_revolution_speed = 0.5
let neptune_revolution_speed = 0.4


function createMaterialArray() {
  const skyboxImagepaths = ['../img/skybox/space_ft.png', '../img/skybox/space_bk.png', '../img/skybox/space_up.png', '../img/skybox/space_dn.png', '../img/skybox/space_rt.png', '../img/skybox/space_lf.png']
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  const planetTexture = loader.load(texture);
  const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });

  const planet = new THREE.Mesh(geometry, material);

  return planet
}

function createRing(innerRadius) {
  let outerRadius = innerRadius - 0.1
  let thetaSegments = 100
  
  // Create a more 3D looking ring using a tube geometry instead of a flat ring
  const ringGeometry = new THREE.TorusGeometry(innerRadius, 0.1, 16, 100);
  const ringMaterial = new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    emissive: '#333333',
    metalness: 0.8,
    roughness: 0.2
  });
  
  const mesh = new THREE.Mesh(ringGeometry, ringMaterial);
  scene.add(mesh)
  mesh.rotation.x = Math.PI / 2
  return mesh;
}

// Add this function to handle mouse movement
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update nameDiv position
  const nameDiv = document.getElementById('planet-name');
  if (nameDiv) {
    nameDiv.style.left = event.clientX + 10 + 'px';
    nameDiv.style.top = event.clientY + 10 + 'px';
  }
}

// Add this near the top with your other variable declarations
let speedMultiplier = 1;
// Add animation state variable
let animationPaused = false;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  setSkyBox();
  
  // Create contact info overlay
  const contactDiv = document.createElement('div');
  contactDiv.style.position = 'absolute';
  contactDiv.style.top = '20px';
  contactDiv.style.right = '20px';
  contactDiv.style.color = 'white';
  contactDiv.style.fontFamily = 'Arial, sans-serif';
  contactDiv.style.zIndex = '1000';
  contactDiv.style.textAlign = 'right';
  contactDiv.innerHTML = `
    <div style="margin-bottom: 10px;">Contact me: <a href="mailto:simosmichail176@gmail.com" style="color: #00aaff; text-decoration: none;">simosmichail176@gmail.com</a></div>
    <div>This app was made by Simos Michail<br>Software Developer</div>
  `;
  document.body.appendChild(contactDiv);
  
  // Create planets first
  planet_earth = loadPlanetTexture("../img/earth_hd.jpg", 4, 100, 100, 'standard');
  planet_sun = loadPlanetTexture("../img/sun_hd.jpg", 20, 100, 100, 'basic');
  planet_mercury = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100, 'standard');
  planet_venus = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100, 'standard');
  planet_mars = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100, 'standard');
  planet_jupiter = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100, 'standard');
  planet_saturn = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100, 'standard');
  planet_uranus = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100, 'standard');
  planet_neptune = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100, 'standard');
  
  // Initialize sun clock
  sunClock = new THREE.Clock();
  
  // Now create sun flames after planets are created
  createSunFlames();

  // Add names to planets for hover effect
  planet_sun.userData.name = "Sun";
  planet_mercury.userData.name = "Mercury";
  planet_venus.userData.name = "Venus";
  planet_earth.userData.name = "Earth";
  planet_mars.userData.name = "Mars";
  planet_jupiter.userData.name = "Jupiter";
  planet_saturn.userData.name = "Saturn";
  planet_uranus.userData.name = "Uranus";
  planet_neptune.userData.name = "Neptune";

  // ADD PLANETS TO THE SCENE
  scene.add(planet_earth);
  scene.add(planet_sun);
  scene.add(planet_mercury);
  scene.add(planet_venus);
  scene.add(planet_mars);
  scene.add(planet_jupiter);
  scene.add(planet_saturn);
  scene.add(planet_uranus);
  scene.add(planet_neptune);

  const sunLight = new THREE.PointLight(0xffffff, 1, 0); // White light, intensity 1, no distance attenuation
  sunLight.position.copy(planet_sun.position); // Position the light at the Sun's position
  scene.add(sunLight);

  // Rotation orbit
  createRing(mercury_orbit_radius)
  createRing(venus_orbit_radius)
  createRing(earth_orbit_radius)
  createRing(mars_orbit_radius)
  createRing(jupiter_orbit_radius)
  createRing(saturn_orbit_radius)
  createRing(uranus_orbit_radius)
  createRing(neptune_orbit_radius)

  // Setup raycaster for hover effects
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-1, -1); // Initialize off-screen
  
  // Create planet name div
  const nameDiv = document.createElement('div');
  nameDiv.id = 'planet-name';
  nameDiv.style.position = 'absolute';
  nameDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
  nameDiv.style.color = 'white';
  nameDiv.style.padding = '5px 10px';
  nameDiv.style.borderRadius = '5px';
  nameDiv.style.display = 'none';
  nameDiv.style.pointerEvents = 'none';
  nameDiv.style.zIndex = '1000';
  document.body.appendChild(nameDiv);
  
  // Add event listener for mouse movement
  document.addEventListener('mousemove', onMouseMove);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;

  camera.position.z = 100;
  
  // Create speed control UI
  const speedControlContainer = document.createElement('div');
  speedControlContainer.style.position = 'absolute';
  speedControlContainer.style.bottom = '20px';
  speedControlContainer.style.left = '20px';
  speedControlContainer.style.zIndex = '1000';

  // Add play/pause button
  const playPauseBtn = document.createElement('button');
  playPauseBtn.textContent = 'Pause';
  playPauseBtn.style.padding = '8px 16px';
  playPauseBtn.style.marginRight = '10px';
  playPauseBtn.style.backgroundColor = '#333';
  playPauseBtn.style.color = 'white';
  playPauseBtn.style.border = 'none';
  playPauseBtn.style.borderRadius = '4px';
  playPauseBtn.style.cursor = 'pointer';
  playPauseBtn.addEventListener('click', () => {
    animationPaused = !animationPaused;
    playPauseBtn.textContent = animationPaused ? 'Play' : 'Pause';
  });

  const decreaseBtn = document.createElement('button');
  decreaseBtn.textContent = 'Slow Down';
  decreaseBtn.style.padding = '8px 16px';
  decreaseBtn.style.marginRight = '10px';
  decreaseBtn.style.backgroundColor = '#333';
  decreaseBtn.style.color = 'white';
  decreaseBtn.style.border = 'none';
  decreaseBtn.style.borderRadius = '4px';
  decreaseBtn.style.cursor = 'pointer';
  decreaseBtn.addEventListener('click', () => {
    speedMultiplier = Math.max(0.1, speedMultiplier - 0.1);
  });

  const increaseBtn = document.createElement('button');
  increaseBtn.textContent = 'Speed Up';
  increaseBtn.style.padding = '8px 16px';
  increaseBtn.style.backgroundColor = '#333';
  increaseBtn.style.color = 'white';
  increaseBtn.style.border = 'none';
  increaseBtn.style.borderRadius = '4px';
  increaseBtn.style.cursor = 'pointer';
  increaseBtn.addEventListener('click', () => {
    speedMultiplier = Math.min(3, speedMultiplier + 0.1);
  });

  const speedDisplay = document.createElement('span');
  speedDisplay.textContent = 'Speed: 1x';
  speedDisplay.style.color = 'white';
  speedDisplay.style.marginLeft = '10px';
  speedDisplay.style.fontFamily = 'Arial, sans-serif';

  // Append all buttons and display to the container in the correct order
  speedControlContainer.appendChild(playPauseBtn);
  speedControlContainer.appendChild(decreaseBtn);
  speedControlContainer.appendChild(increaseBtn);
  speedControlContainer.appendChild(speedDisplay);
  document.body.appendChild(speedControlContainer);
}

function planetRevolver(time, speed, planet, orbitRadius, planetName) {
  let orbitSpeedMultiplier = 0.001;
  // Apply the speed multiplier to control revolution speed
  const planetAngle = time * orbitSpeedMultiplier * speed * speedMultiplier;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}

// Add function to create sun flames
function createSunFlames() {
  // Create a group for sun and its particles
  const sunGroup = new THREE.Group();
  scene.add(sunGroup);
  sunGroup.add(planet_sun);
  
  // Create particles for sun flames
  const particleCount = 2000;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  // Define flame colors
  const flameColors = [
    new THREE.Color(0xff4500), // Orange-red
    new THREE.Color(0xff0000), // Red
    new THREE.Color(0xffff00), // Yellow
    new THREE.Color(0xffa500)  // Orange
  ];
  
  // Create particles with random positions around the sun
  for (let i = 0; i < particleCount; i++) {
    // Random position around the sun
    const radius = 20 + Math.random() * 5; // Sun radius + flame extension
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Random color from flame colors
    const color = flameColors[Math.floor(Math.random() * flameColors.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  sunParticles = new THREE.Points(particles, particleMaterial);
  sunGroup.add(sunParticles);
  
  // Initialize clock for animation
  sunClock = new THREE.Clock();
}

function animate(time) {
  requestAnimationFrame(animate);

  // Update speed display
  const speedDisplay = document.querySelector('span');
  if (speedDisplay) {
    speedDisplay.textContent = `Speed: ${speedMultiplier.toFixed(1)}x`;
  }

  // Only update animations if not paused
  if (!animationPaused) {
    // Rotate the planets
    const rotationSpeed = 0.005 * speedMultiplier;
    planet_earth.rotation.y += rotationSpeed;
    planet_sun.rotation.y += rotationSpeed;
    planet_mercury.rotation.y += rotationSpeed;
    planet_venus.rotation.y += rotationSpeed;
    planet_mars.rotation.y += rotationSpeed;
    planet_jupiter.rotation.y += rotationSpeed;
    planet_saturn.rotation.y += rotationSpeed;
    planet_uranus.rotation.y += rotationSpeed;
    planet_neptune.rotation.y += rotationSpeed;

    // Revolve planets around the sun
    planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius, 'mercury')
    planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius, 'venus')
    planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius, 'earth')
    planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius, 'mars')
    planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, 'jupiter')
    planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius, 'saturn')
    planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius, 'uranus')
    planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius, 'neptune')

    // Animate sun flames
    if (sunParticles) {
      const elapsedTime = sunClock.getElapsedTime();
      const positions = sunParticles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Create pulsating effect
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        const distance = Math.sqrt(x * x + y * y + z * z);
        const normalizedX = x / distance;
        const normalizedY = y / distance;
        const normalizedZ = z / distance;
        
        // Pulsate the particles
        const pulseFactor = 1 + 0.2 * Math.sin(elapsedTime * 2 + i);
        const newDistance = 20 + Math.random() * 5 * pulseFactor;
        
        positions[i] = normalizedX * newDistance;
        positions[i + 1] = normalizedY * newDistance;
        positions[i + 2] = normalizedZ * newDistance;
      }
      
      sunParticles.geometry.attributes.position.needsUpdate = true;
      
      // Rotate the sun particles
      sunParticles.rotation.y += 0.003;
      sunParticles.rotation.z += 0.001;
    }
  }

  // Always check for hover intersections, even when paused
  raycaster.setFromCamera(mouse, camera);
  const celestialBodies = [
    planet_sun, planet_mercury, planet_venus, planet_earth, 
    planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune
  ];
  const intersects = raycaster.intersectObjects(celestialBodies);
  
  const nameDiv = document.getElementById('planet-name');
  if (nameDiv) {
    if (intersects.length > 0) {
      hoveredObject = intersects[0].object;
      nameDiv.textContent = hoveredObject.userData.name;
      nameDiv.style.display = 'block';
    } else {
      hoveredObject = null;
      nameDiv.style.display = 'none';
    }
  }

  // Animate sun flames
  if (sunParticles) {
    const elapsedTime = sunClock.getElapsedTime();
    const positions = sunParticles.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Create pulsating effect
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalizedX = x / distance;
      const normalizedY = y / distance;
      const normalizedZ = z / distance;
      
      // Pulsate the particles
      const pulseFactor = 1 + 0.2 * Math.sin(elapsedTime * 2 + i);
      const newDistance = 20 + Math.random() * 5 * pulseFactor;
      
      positions[i] = normalizedX * newDistance;
      positions[i + 1] = normalizedY * newDistance;
      positions[i + 2] = normalizedZ * newDistance;
    }
    
    sunParticles.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the sun particles
    sunParticles.rotation.y += 0.003;
    sunParticles.rotation.z += 0.001;
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

init();
animate(0); // Initialize with time 0
