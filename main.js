// Main game logic for Grid Glider

// Global variables
let scene, camera, renderer;
let player, obstacles = [];
let obstacleTextures = [];
let clock, score = 0;
let gameOver = false;
let speed = 0.1; // base speed
const laneX = [-4, -2, 0, 2, 4];
let currentLane = 2; // start in middle

const scoreDiv = document.getElementById('score');
const overlay = document.getElementById('overlay');

// Initialize the scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0,0,0);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Player
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00, emissive:0x00ff00});
    player = new THREE.Mesh(geometry, material);
    player.position.y = 0.5;
    player.position.x = laneX[currentLane];
    scene.add(player);

    // Grid floor
    const gridHelper = new THREE.GridHelper(100, 20, 0x00ff00, 0x00ff00);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Load obstacle textures
    const loader = new THREE.TextureLoader();
    for (let i = 1; i <= 5; i++) {
        obstacleTextures.push(loader.load('assetsobstacle' + i + '.png'));
    }

    clock = new THREE.Clock();

    spawnObstacle();
    animate();
}

// Spawn a new obstacle ahead of the player
function spawnObstacle() {
    const size = 1.5;
    const geometry = new THREE.BoxGeometry(size,size,size);
    const tex = obstacleTextures[Math.floor(Math.random()*obstacleTextures.length)];
    const material = new THREE.MeshStandardMaterial({map: tex, emissive:0x222222});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -50;
    const laneIndex = Math.floor(Math.random()*laneX.length);
    mesh.position.x = laneX[laneIndex];
    mesh.position.y = size/2;
    scene.add(mesh);
    obstacles.push(mesh);

    // Schedule next obstacle
    const delay = 1000 + Math.random()*1000; // 1-2 sec
    setTimeout(spawnObstacle, delay);
}

// Handle key input
window.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.key === 'r' || e.key === 'R') resetGame();
        return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        currentLane = Math.max(0, currentLane - 1);
        player.position.x = laneX[currentLane];
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        currentLane = Math.min(laneX.length-1, currentLane + 1);
        player.position.x = laneX[currentLane];
    }
});

// Reset the game
function resetGame() {
    // Remove obstacles
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    score = 0;
    speed = 0.1;
    currentLane = 2;
    player.position.x = laneX[currentLane];
    gameOver = false;
    overlay.classList.add('hidden');
    clock.start();
}

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (!gameOver) {
        // Move obstacles toward player
        obstacles.forEach(o => {
            o.position.z += speed;
        });
        // Remove obstacles that passed the player
        obstacles = obstacles.filter(o => {
            if (o.position.z > camera.position.z) {
                scene.remove(o);
                return false;
            }
            return true;
        });

        // Collision detection
        obstacles.forEach(o => {
            if (o.position.distanceTo(player.position) < 1) {
                gameOver = true;
                overlay.classList.remove('hidden');
            }
        });

        // Update score
        score += delta * 10;
        scoreDiv.textContent = 'Score: ' + Math.floor(score);

        // Increase difficulty
        speed += delta * 0.002;
    }

    renderer.render(scene, camera);
}

init();
