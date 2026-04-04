/**
 * Wedding 3D Temple Viewer - script.js
 * Three.js GLB Model Loader with Wedding Theme
 */

// Model path - easily changeable
const MODEL_PATH = './source/temple.glb';

// Global variables
let scene, camera, renderer, model, loader;
let isAutoRotate = true;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = 0;
let targetRotationY = 0;
let targetZoom = 10;
let autoRotateSpeed = 0.005;

// Initialize the viewer
function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Dark black background
    scene.background = new THREE.Color(0x000000);
    
    // Dark black fog for depth
    scene.fog = new THREE.Fog(0x000000, 15, 50);

    // Camera setup - optimized position
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 4, 6);
    camera.lookAt(0, 1.5, 0);

    // Renderer setup - optimized for faster loading
    renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Disabled for faster loading
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    renderer.shadowMap.enabled = false; // Disabled for faster loading
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Setup lighting - simplified for faster
    setupLighting();

    // Setup ground
    setupGround();

    // Initialize the loader
    loader = new THREE.GLTFLoader();
    
    // Load the 3D model
    loadModel();

    // Setup controls
    setupControls();

    // Setup UI buttons
    setupUIButtons();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Setup optimized lighting
function setupLighting() {
    // Ambient light - brighter for dark background
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    scene.add(ambientLight);

    // Main directional light - bright
    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    sunLight.position.set(5, 10, 5);
    scene.add(sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
}

// Setup ground plane - minimal
function setupGround() {
    // Simple dark ground
    const groundGeometry = new THREE.CircleGeometry(10, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);
}

// Load GLB model using GLTFLoader
function loadModel() {
    // Show loading indicator
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hidden');
    
    loader.load(
        MODEL_PATH,
        (gltf) => {
            // Model loaded successfully
            model = gltf.scene;
            
            // Center and scale the model
            centerAndScaleModel(model);
            
            // Add model to scene
            scene.add(model);
            
            // Create decorative elements around the model
            addDecorativeElements();
            
            // Hide loading indicator
            loadingOverlay.classList.add('hidden');
            
            console.log('Model loaded successfully!');
        },
        (progress) => {
            // Loading progress
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            document.getElementById('loading-percent').textContent = percent;
        },
        (error) => {
            // Error handling
            console.error('Error loading model:', error);
            
            // Show error message
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.classList.add('hidden');
            
            const errorMessage = document.getElementById('error-message');
            errorMessage.classList.add('show');
            
            // Create fallback temple
            createFallbackTemple();
        }
    );
}

// Center and auto-scale the model
function centerAndScaleModel(model) {
    // Get bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Calculate desired scale
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 5;
    const scale = desiredSize / maxDim;
    
    // Apply scale
    model.scale.set(scale, scale, scale);
    
    // Recenter the model
    model.position.x = -center.x * scale;
    model.position.y = -box.min.y * scale;
    model.position.z = -center.z * scale;
    
    // Store original Y for reference
    model.userData.originalY = model.position.y;
    
    // Update target zoom based on model size
    targetZoom = maxDim * 2;
}

// Create fallback temple if model fails to load
function createFallbackTemple() {
    model = new THREE.Group();
    
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xF4A460, roughness: 0.7 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xE74C3C, roughness: 0.6 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.5, roughness: 0.3 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });

    // Base/Steps
    for (let i = 0; i < 3; i++) {
        const stepGeometry = new THREE.BoxGeometry(5 + i * 0.8, 0.2, 5 + i * 0.8);
        const step = new THREE.Mesh(stepGeometry, stoneMaterial);
        step.position.y = i * 0.2;
        step.castShadow = true;
        step.receiveShadow = true;
        model.add(step);
    }

    // Main Building
    const mainBuildingGeometry = new THREE.BoxGeometry(4, 3, 4);
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, wallMaterial);
    mainBuilding.position.y = 1.7;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    model.add(mainBuilding);

    // Dome
    const domeGeometry = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeometry, roofMaterial);
    dome.position.y = 3.2;
    dome.castShadow = true;
    model.add(dome);

    // Dome Top
    const domeTopGeometry = new THREE.ConeGeometry(0.4, 0.8, 16);
    const domeTop = new THREE.Mesh(domeTopGeometry, goldMaterial);
    domeTop.position.y = 3.9;
    domeTop.castShadow = true;
    model.add(domeTop);

    // Pillars
    const pillarPositions = [
        [-1.5, 0, -1.5], [1.5, 0, -1.5],
        [-1.5, 0, 1.5], [1.5, 0, 1.5]
    ];

    pillarPositions.forEach(pos => {
        const pillarGeometry = new THREE.CylinderGeometry(0.15, 0.18, 2.5, 8);
        const pillar = new THREE.Mesh(pillarGeometry, wallMaterial);
        pillar.position.set(pos[0], 2.45, pos[2]);
        pillar.castShadow = true;
        model.add(pillar);
    });

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3728 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.1, 2);
    model.add(door);

    // Door Arch
    const archGeometry = new THREE.TorusGeometry(0.5, 0.08, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeometry, goldMaterial);
    arch.position.set(0, 2.2, 2);
    arch.castShadow = true;
    model.add(arch);

    scene.add(model);
}

// Add decorative elements around the model - minimal
function addDecorativeElements() {
    // Simple glowing lamp posts
    const lampPositions = [[3, 0, 3], [-3, 0, 3], [3, 0, -3], [-3, 0, -3]];
    const lampMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700, 
        emissive: 0xFFD700, 
        emissiveIntensity: 0.5 
    });

    lampPositions.forEach(pos => {
        // Lamp sphere
        const lampGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(pos[0], 1.2, pos[2]);
        scene.add(lamp);
    });
}

// Setup mouse and touch controls
function setupControls() {
    const canvas = renderer.domElement;

    // Mouse controls
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || !model) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        
        // Clamp vertical rotation
        targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });

    // Touch controls
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || !model) return;
        
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
        
        previousMousePosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    });

    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Zoom with scroll
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetZoom += e.deltaY * 0.01;
        targetZoom = Math.max(5, Math.min(20, targetZoom));
    }, { passive: false });
}

// Setup UI buttons
function setupUIButtons() {
    // Reset View button
    document.getElementById('reset-btn').addEventListener('click', resetView);
    
    // Auto Rotate toggle button
    document.getElementById('rotate-btn').addEventListener('click', toggleAutoRotate);
    
    // Rotation speed slider
    document.getElementById('rotation-speed').addEventListener('input', function(e) {
        autoRotateSpeed = e.target.value * 0.001;
    });
    
    // Error retry button
    document.getElementById('retry-btn').addEventListener('click', () => {
        document.getElementById('error-message').classList.remove('show');
        loadModel();
    });
}

// Reset view to default position
function resetView() {
    targetRotationX = 0;
    targetRotationY = 0;
    targetZoom = 10;
    
    if (model) {
        model.rotation.x = 0;
        model.rotation.y = 0;
    }
    
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 2, 0);
}

// Toggle auto-rotation
function toggleAutoRotate() {
    isAutoRotate = !isAutoRotate;
    
    const rotateBtn = document.getElementById('rotate-btn');
    if (isAutoRotate) {
        rotateBtn.classList.add('active');
    } else {
        rotateBtn.classList.remove('active');
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (model) {
        // Smooth rotation interpolation
        model.rotation.y += (targetRotationY - model.rotation.y) * 0.1;
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.1;
        
        // Auto-rotation when not dragging
        if (!isDragging && isAutoRotate) {
            model.rotation.y += autoRotateSpeed;
        }
        
        // Smooth zoom
        const currentDistance = camera.position.length();
        const newDistance = currentDistance + (targetZoom - currentDistance) * 0.1;
        
        // Update camera position while maintaining direction
        const direction = camera.position.clone().normalize();
        camera.position.copy(direction.multiplyScalar(newDistance));
    }
    
    renderer.render(scene, camera);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);