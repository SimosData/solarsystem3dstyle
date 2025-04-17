// ... existing code ...

// Create the sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);
sun.userData.name = "Sun"; // Add name for hover effect

// Create planets
const planets = [];
const planetData = [
  { name: "Mercury", radius: 0.5, distance: 10, speed: 0.04, texture: mercuryTexture },
  { name: "Venus", radius: 0.8, distance: 15, speed: 0.015, texture: venusTexture },
  { name: "Earth", radius: 1, distance: 20, speed: 0.01, texture: earthTexture },
  { name: "Mars", radius: 0.7, distance: 25, speed: 0.008, texture: marsTexture },
  { name: "Jupiter", radius: 2, distance: 35, speed: 0.002, texture: jupiterTexture },
  { name: "Saturn", radius: 1.8, distance: 45, speed: 0.0009, texture: saturnTexture },
  { name: "Uranus", radius: 1.2, distance: 55, speed: 0.0004, texture: uranusTexture },
  { name: "Neptune", radius: 1.2, distance: 65, speed: 0.0001, texture: neptuneTexture }
];

planetData.forEach(planet => {
  const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ map: planet.texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = planet.distance;
  mesh.userData = { 
    distance: planet.distance, 
    speed: planet.speed,
    name: planet.name // Add name for hover effect
  };
  scene.add(mesh);
  planets.push(mesh);
});

// Add raycaster for hover effects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;
const nameDiv = document.createElement('div');
nameDiv.style.position = 'absolute';
nameDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
nameDiv.style.color = 'white';
nameDiv.style.padding = '5px 10px';
nameDiv.style.borderRadius = '5px';
nameDiv.style.display = 'none';
nameDiv.style.pointerEvents = 'none';
document.body.appendChild(nameDiv);

// Add event listeners for mouse movement
document.addEventListener('mousemove', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update nameDiv position
  nameDiv.style.left = event.clientX + 10 + 'px';
  nameDiv.style.top = event.clientY + 10 + 'px';
});

// In your animation loop, add this code to handle hover effects
function animate() {
  // ... existing animation code ...
  
  // Check for hover intersections
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([sun, ...planets]);
  
  if (intersects.length > 0) {
    if (hoveredObject !== intersects[0].object) {
      hoveredObject = intersects[0].object;
      nameDiv.textContent = hoveredObject.userData.name;
      nameDiv.style.display = 'block';
    }
  } else {
    hoveredObject = null;
    nameDiv.style.display = 'none';
  }
  
  // ... rest of your animation code ...
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}