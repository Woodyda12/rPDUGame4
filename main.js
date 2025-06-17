/*  Grid Glider – Design for Cost Edition
    Complete game logic – Three.js endless-runner
--------------------------------------------------------------------*/

// ----- Global state ------------------------------------------------
let scene, camera, renderer;
let player;
let obstacles = [];
let obstacleTextures = [];        // loaded PNGs
const laneX = [-4, -2, 0, 2, 4];  // 5-lane grid
let currentLane = 2;              // start in centre lane

let clock;                        // Three.js clock
let score = 0;
let speed = 0.10;                 // base forward speed
let gameOver = false;

// ----- UI elements -------------------------------------------------
const scoreDiv = document.getElementById('score');
const overlay  = document.getElementById('overlay');

// ------------------------------------------------------------------
//  Initialisation
// ------------------------------------------------------------------
function init () {
  // Scene & camera
  scene   = new THREE.Scene();
  camera  = new THREE.PerspectiveCamera(
              75,
              window.innerWidth / window.innerHeight,
              0.1,
              1000
            );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Basic lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Grid floor
  const grid = new THREE.GridHelper(100, 20, 0x00ff00, 0x00ff00);
  grid.position.y = 0;
  scene.add(grid);

  // Player mesh
  const playerGeom  = new THREE.BoxGeometry(1, 1, 1);
  const playerMat   = new THREE.MeshStandardMaterial({
                        color: 0x00ff00,
                        emissive: 0x00ff00,
                        emissiveIntensity: 1
                      });
  player = new THREE.Mesh(playerGeom, playerMat);
  player.position.set(laneX[currentLane], 0.5, 0);
  scene.add(player);

  // Load obstacle textures
  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 5; i++) {
    obstacleTextures.push(loader.load(`assets/obstacle${i}.png`));
  }

  // Handle window resizing
  window.addEventListener('resize', onWindowResize);

  // Input handling
  window.addEventListener('keydown', handleKeyDown);

  // Start clock & first obstacle
  clock = new THREE.Clock();
  spawnObstacle();

  // Kick off render loop
  animate();
}

// ------------------------------------------------------------------
//  Input
// ------------------------------------------------------------------
function handleKeyDown (e) {
  // Restart if game over
  if (gameOver && (e.key.toLowerCase() === 'r' || e.code === 'KeyR')) {
    resetGame();
    return;
  }

  // Ignore other keys when game over
  if (gameOver) return;

  // Move left / right
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
    currentLane = Math.max(0, currentLane - 1);
    player.position.x = laneX[currentLane];
  }
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
    currentLane = Math.min(laneX.length - 1, currentLane + 1);
    player.position.x = laneX[currentLane];
  }
}

// ------------------------------------------------------------------
//  Spawn new obstacle
// ------------------------------------------------------------------
function spawnObstacle () {
  const size = 1.5;
  const geom = new THREE.BoxGeometry(size, size, size);
  const tex  = obstacleTextures[Math.floor(Math.random() * obstacleTextures.length)];
  const mat  = new THREE.MeshStandardMaterial({
                map: tex,
                emissive: 0x222222,
                emissiveIntensity: 0.8
              });
  const obs  = new THREE.Mesh(geom, mat);

  // Position far ahead in random lane
  obs.position.set(
    laneX[Math.floor(Math.random() * laneX.length)],
    size / 2,
    -50
  );

  scene.add(obs);
  obstacles.push(obs);

  // Schedule next obstacle (1 – 2 s)
  const delay = 1000 + Math.random() * 1000;
  setTimeout(spawnObstacle, delay);
}

// ------------------------------------------------------------------
//  Game loop
// ------------------------------------------------------------------
function animate () {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (!gameOver) {
    // Move obstacles towards camera
    obstacles.forEach(o => { o.position.z += speed; });

    // Remove passed obstacles
    obstacles = obstacles.filter(o => {
      if (o.position.z > camera.position.z) {
        scene.remove(o);
        return false;
      }
      return true;
    });

    // Collision check
    obstacles.forEach(o => {
      if (o.position.distanceTo(player.position) < 1) {
        gameOver = true;
        overlay.classList.remove('hidden');
      }
    });

    // Update score & difficulty
    score += delta * 10;                   // 10 pts / sec
    speed += delta * 0.002;                // slow ramp-up
    scoreDiv.textContent = `Score: ${Math.floor(score)}`;
  }

  renderer.render(scene, camera);
}

// ------------------------------------------------------------------
//  Reset after crash
// ------------------------------------------------------------------
function resetGame () {
  // Clear existing obstacles
  obstacles.forEach(o => scene.remove(o));
  obstacles.length = 0;

  // Reset state
  score        = 0;
  speed        = 0.10;
  currentLane  = 2;
  player.position.x = laneX[currentLane];
  gameOver     = false;
  overlay.classList.add('hidden');

  // Reset clock & start new obstacle stream
  clock.start();
  spawnObstacle();
}

// ------------------------------------------------------------------
//  Utilities
// ------------------------------------------------------------------
function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ------------------------------------------------------------------
init();
