import * as THREE from 'three';

// Game constants
const ARENA_SIZE = 100;
const GRID_SIZE = 100;
const CYCLE_SPEED = 0.15;
const AI_CYCLE_SPEED = 0.12;
const TURN_COOLDOWN = 200; // milliseconds
const TRAIL_WIDTH = 0.8;
const CYCLE_SIZE = 1.5;

// Game state
let scene, camera, renderer;
let playerCycle, aiCycle;
let playerTrail = [];
let aiTrail = [];
let playerDirection = new THREE.Vector3(0, 0, 1);
let aiDirection = new THREE.Vector3(0, 0, -1);
let gameActive = false;
let score = 0;
let startTime;
let lastTurnTime = 0;
let animationId;

// Minimap
let minimapCanvas, minimapCtx;

// Initialize the game
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    scene.fog = new THREE.Fog(0x000510, 50, 150);

    // Camera setup with better perspective
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 30, -20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Create arena
    createArena();

    // Create cycles
    createCycles();

    // Setup minimap
    setupMinimap();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);

    // Start render loop
    animate();
}

// Create the game arena
function createArena() {
    // Grid floor
    const gridHelper = new THREE.GridHelper(ARENA_SIZE, GRID_SIZE, 0x00ffff, 0x003333);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Floor plane with glow effect
    const floorGeometry = new THREE.PlaneGeometry(ARENA_SIZE, ARENA_SIZE);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x001122,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x001133,
        emissiveIntensity: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Arena walls
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6
    });

    const wallHeight = 5;
    const wallThickness = 0.5;

    // North wall
    const northWall = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_SIZE, wallHeight, wallThickness),
        wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -ARENA_SIZE / 2);
    northWall.castShadow = true;
    scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_SIZE, wallHeight, wallThickness),
        wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, ARENA_SIZE / 2);
    southWall.castShadow = true;
    scene.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, ARENA_SIZE),
        wallMaterial
    );
    eastWall.position.set(ARENA_SIZE / 2, wallHeight / 2, 0);
    eastWall.castShadow = true;
    scene.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, ARENA_SIZE),
        wallMaterial
    );
    westWall.position.set(-ARENA_SIZE / 2, wallHeight / 2, 0);
    westWall.castShadow = true;
    scene.add(westWall);
}

// Create light cycles
function createCycles() {
    // Player cycle (blue/cyan)
    const playerGeometry = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(CYCLE_SIZE, CYCLE_SIZE * 0.6, CYCLE_SIZE * 1.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGeometry.add(body);

    // Front light
    const frontLightGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const frontLightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const frontLight = new THREE.Mesh(frontLightGeom, frontLightMat);
    frontLight.position.z = CYCLE_SIZE * 0.75;
    frontLight.position.y = 0.2;
    playerGeometry.add(frontLight);

    // Point light for glow
    const cycleLight = new THREE.PointLight(0x00ffff, 2, 10);
    cycleLight.position.set(0, 1, 0);
    playerGeometry.add(cycleLight);

    playerCycle = playerGeometry;
    playerCycle.position.set(-20, CYCLE_SIZE * 0.3, 0);
    scene.add(playerCycle);

    // AI cycle (orange/red)
    const aiGeometry = new THREE.Group();
    
    const aiBodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    const aiBody = new THREE.Mesh(bodyGeometry, aiBodyMaterial);
    aiBody.castShadow = true;
    aiGeometry.add(aiBody);

    const aiFrontLightMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const aiFrontLight = new THREE.Mesh(frontLightGeom, aiFrontLightMat);
    aiFrontLight.position.z = CYCLE_SIZE * 0.75;
    aiFrontLight.position.y = 0.2;
    aiGeometry.add(aiFrontLight);

    const aiCycleLight = new THREE.PointLight(0xff6600, 2, 10);
    aiCycleLight.position.set(0, 1, 0);
    aiGeometry.add(aiCycleLight);

    aiCycle = aiGeometry;
    aiCycle.position.set(20, CYCLE_SIZE * 0.3, 0);
    aiCycle.rotation.y = Math.PI;
    scene.add(aiCycle);
}

// Create light trail segment
function createTrailSegment(position, direction, color) {
    const trailGeometry = new THREE.BoxGeometry(
        Math.abs(direction.x) > 0.5 ? TRAIL_WIDTH : TRAIL_WIDTH * 0.3,
        2,
        Math.abs(direction.z) > 0.5 ? TRAIL_WIDTH : TRAIL_WIDTH * 0.3
    );
    
    const trailMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8,
        metalness: 0.5,
        roughness: 0.3
    });
    
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.position.copy(position);
    trail.position.y = 1;
    trail.castShadow = true;
    scene.add(trail);
    
    return trail;
}

// Update camera to follow player
function updateCamera() {
    const targetPosition = new THREE.Vector3(
        playerCycle.position.x - playerDirection.x * 15,
        playerCycle.position.y + 20,
        playerCycle.position.z - playerDirection.z * 15
    );
    
    camera.position.lerp(targetPosition, 0.05);
    
    const lookAtPosition = new THREE.Vector3(
        playerCycle.position.x + playerDirection.x * 10,
        playerCycle.position.y,
        playerCycle.position.z + playerDirection.z * 10
    );
    
    camera.lookAt(lookAtPosition);
}

// Handle keyboard input
function onKeyDown(event) {
    if (!gameActive) return;
    
    const now = Date.now();
    if (now - lastTurnTime < TURN_COOLDOWN) return;
    
    const key = event.key.toLowerCase();
    
    // Prevent 180-degree turns
    let newDirection = null;
    
    if ((key === 'arrowleft' || key === 'a') && Math.abs(playerDirection.x) < 0.5) {
        newDirection = new THREE.Vector3(-1, 0, 0);
    } else if ((key === 'arrowright' || key === 'd') && Math.abs(playerDirection.x) < 0.5) {
        newDirection = new THREE.Vector3(1, 0, 0);
    } else if ((key === 'arrowup' || key === 'w') && Math.abs(playerDirection.z) < 0.5) {
        newDirection = new THREE.Vector3(0, 0, -1);
    } else if ((key === 'arrowdown' || key === 's') && Math.abs(playerDirection.z) < 0.5) {
        newDirection = new THREE.Vector3(0, 0, 1);
    }
    
    if (newDirection) {
        playerDirection = newDirection;
        
        // Rotate cycle to face direction
        playerCycle.rotation.y = Math.atan2(playerDirection.x, playerDirection.z);
        
        // Add trail segment
        const trail = createTrailSegment(playerCycle.position.clone(), playerDirection, 0x00ffff);
        playerTrail.push({
            mesh: trail,
            position: playerCycle.position.clone(),
            direction: playerDirection.clone()
        });
        
        lastTurnTime = now;
    }
}

// Simple AI for opponent
function updateAI() {
    // AI turns randomly or when approaching walls/trails
    const distanceToWall = ARENA_SIZE / 2 - 5;
    
    if (Math.abs(aiCycle.position.x) > distanceToWall || 
        Math.abs(aiCycle.position.z) > distanceToWall ||
        Math.random() < 0.01) {
        
        // Choose a random perpendicular direction
        const possibleDirections = [];
        
        if (Math.abs(aiDirection.x) > 0.5) {
            possibleDirections.push(new THREE.Vector3(0, 0, 1));
            possibleDirections.push(new THREE.Vector3(0, 0, -1));
        } else {
            possibleDirections.push(new THREE.Vector3(1, 0, 0));
            possibleDirections.push(new THREE.Vector3(-1, 0, 0));
        }
        
        // Choose direction that keeps AI away from walls
        let bestDirection = possibleDirections[0];
        let bestScore = -Infinity;
        
        for (const dir of possibleDirections) {
            const testPos = aiCycle.position.clone().add(dir.clone().multiplyScalar(10));
            const score = -(Math.abs(testPos.x) + Math.abs(testPos.z));
            if (score > bestScore) {
                bestScore = score;
                bestDirection = dir;
            }
        }
        
        aiDirection = bestDirection;
        aiCycle.rotation.y = Math.atan2(aiDirection.x, aiDirection.z);
        
        const trail = createTrailSegment(aiCycle.position.clone(), aiDirection, 0xff6600);
        aiTrail.push({
            mesh: trail,
            position: aiCycle.position.clone(),
            direction: aiDirection.clone()
        });
    }
}

// Check collisions
function checkCollisions() {
    // Check player collisions
    const playerPos = playerCycle.position;
    
    // Wall collision
    if (Math.abs(playerPos.x) > ARENA_SIZE / 2 - 1 || 
        Math.abs(playerPos.z) > ARENA_SIZE / 2 - 1) {
        return 'player';
    }
    
    // Trail collision for player - check against all trails except current segment
    for (let i = 0; i < playerTrail.length - 1; i++) {
        const trail = playerTrail[i];
        const distance = playerPos.distanceTo(trail.position);
        if (distance < TRAIL_WIDTH * 1.5) {
            return 'player';
        }
    }
    
    // Check player collision with AI trail
    for (const trail of aiTrail) {
        const distance = playerPos.distanceTo(trail.position);
        if (distance < TRAIL_WIDTH * 1.5) {
            return 'player';
        }
    }
    
    // Check AI collisions
    const aiPos = aiCycle.position;
    
    // Wall collision
    if (Math.abs(aiPos.x) > ARENA_SIZE / 2 - 1 || 
        Math.abs(aiPos.z) > ARENA_SIZE / 2 - 1) {
        return 'ai';
    }
    
    // Trail collision for AI - check against all trails except current segment
    for (let i = 0; i < aiTrail.length - 1; i++) {
        const trail = aiTrail[i];
        const distance = aiPos.distanceTo(trail.position);
        if (distance < TRAIL_WIDTH * 1.5) {
            return 'ai';
        }
    }
    
    // Check AI collision with player trail
    for (const trail of playerTrail) {
        const distance = aiPos.distanceTo(trail.position);
        if (distance < TRAIL_WIDTH * 1.5) {
            return 'ai';
        }
    }
    
    // Cycle collision
    if (playerPos.distanceTo(aiPos) < CYCLE_SIZE * 1.5) {
        return 'both';
    }
    
    return null;
}

// Update game state
function update() {
    if (!gameActive) return;
    
    // Move player
    playerCycle.position.add(playerDirection.clone().multiplyScalar(CYCLE_SPEED));
    
    // Move AI
    aiCycle.position.add(aiDirection.clone().multiplyScalar(AI_CYCLE_SPEED));
    updateAI();
    
    // Update camera
    updateCamera();
    
    // Check collisions
    const collision = checkCollisions();
    if (collision) {
        endGame(collision === 'ai' ? 'win' : 'lose');
        return;
    }
    
    // Update score
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    score = elapsedTime;
    document.getElementById('score').textContent = `Score: ${score} | Time: ${elapsedTime}s`;
    
    // Update minimap
    updateMinimap();
}

// Setup minimap
function setupMinimap() {
    minimapCanvas = document.getElementById('minimap');
    minimapCtx = minimapCanvas.getContext('2d');
    minimapCanvas.width = 200;
    minimapCanvas.height = 200;
}

// Update minimap display
function updateMinimap() {
    if (!minimapCtx) return;
    
    const ctx = minimapCtx;
    const width = minimapCanvas.width;
    const height = minimapCanvas.height;
    const scale = width / ARENA_SIZE;
    
    // Clear
    ctx.fillStyle = 'rgba(0, 5, 16, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw walls
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Draw trails
    ctx.lineWidth = 3;
    
    // Player trail
    ctx.strokeStyle = '#00ffff';
    for (const trail of playerTrail) {
        const x = (trail.position.x + ARENA_SIZE / 2) * scale;
        const y = (trail.position.z + ARENA_SIZE / 2) * scale;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    
    // AI trail
    ctx.strokeStyle = '#ff6600';
    for (const trail of aiTrail) {
        const x = (trail.position.x + ARENA_SIZE / 2) * scale;
        const y = (trail.position.z + ARENA_SIZE / 2) * scale;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    
    // Draw player cycle
    const playerX = (playerCycle.position.x + ARENA_SIZE / 2) * scale;
    const playerY = (playerCycle.position.z + ARENA_SIZE / 2) * scale;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw AI cycle
    const aiX = (aiCycle.position.x + ARENA_SIZE / 2) * scale;
    const aiY = (aiCycle.position.z + ARENA_SIZE / 2) * scale;
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(aiX, aiY, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start game
window.startGame = function() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameOver').style.display = 'none';
    
    // Reset game state
    gameActive = true;
    score = 0;
    startTime = Date.now();
    lastTurnTime = 0;
    
    // Reset cycles
    playerCycle.position.set(-20, CYCLE_SIZE * 0.3, 0);
    playerDirection = new THREE.Vector3(0, 0, 1);
    playerCycle.rotation.y = Math.atan2(playerDirection.x, playerDirection.z);
    
    aiCycle.position.set(20, CYCLE_SIZE * 0.3, 0);
    aiDirection = new THREE.Vector3(0, 0, -1);
    aiCycle.rotation.y = Math.atan2(aiDirection.x, aiDirection.z);
    
    // Clear trails
    for (const trail of playerTrail) {
        scene.remove(trail.mesh);
    }
    for (const trail of aiTrail) {
        scene.remove(trail.mesh);
    }
    playerTrail = [];
    aiTrail = [];
    
    // Add initial trail segments
    const initialPlayerTrail = createTrailSegment(playerCycle.position.clone(), playerDirection, 0x00ffff);
    playerTrail.push({
        mesh: initialPlayerTrail,
        position: playerCycle.position.clone(),
        direction: playerDirection.clone()
    });
    
    const initialAiTrail = createTrailSegment(aiCycle.position.clone(), aiDirection, 0xff6600);
    aiTrail.push({
        mesh: initialAiTrail,
        position: aiCycle.position.clone(),
        direction: aiDirection.clone()
    });
};

// End game
function endGame(result) {
    gameActive = false;
    
    const gameOverDiv = document.getElementById('gameOver');
    const finalScoreDiv = document.getElementById('finalScore');
    
    if (result === 'win') {
        finalScoreDiv.innerHTML = `<span style="color: #00ff00">YOU WIN!</span><br>Score: ${score}`;
    } else {
        finalScoreDiv.innerHTML = `<span style="color: #ff0000">GAME OVER</span><br>Score: ${score}`;
    }
    
    gameOverDiv.style.display = 'block';
}

// Restart game
window.restartGame = function() {
    window.startGame();
};

// Initialize on load
init();
