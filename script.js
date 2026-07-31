// 3D Planet Viewer Logic
let scene, camera, renderer, controls, currentPlanetGroup;

const planetData = {
    mercury: { color: 0x8c8c8c, size: 0.5 },
    venus: { color: 0xe6e6fa, size: 0.8 },
    earth: { color: 0x2b82c9, size: 0.9 },
    mars: { color: 0xc1440e, size: 0.6 },
    jupiter: { color: 0xd39c7e, size: 2.0 },
    saturn: { color: 0xead6b8, size: 1.7, hasRings: true },
    uranus: { color: 0x4b70dd, size: 1.2 },
    neptune: { color: 0x274687, size: 1.1 }
};

function init3D() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // Add directional light (sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Show initial planet (Earth)
    showPlanet('earth');

    // Animation loop
    animate();
}

function showPlanet(planetId) {
    if (currentPlanetGroup) {
        // Dispose of geometries and materials to prevent memory leaks
        currentPlanetGroup.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        scene.remove(currentPlanetGroup);
    }

    currentPlanetGroup = new THREE.Group();
    const data = planetData[planetId];

    // Create planet sphere
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    // Use MeshStandardMaterial for better lighting reaction
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.7,
        metalness: 0.1
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    currentPlanetGroup.add(planetMesh);

    // Add rings for Saturn
    if (data.hasRings) {
        const ringGeometry = new THREE.RingGeometry(data.size + 0.3, data.size + 1.2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xc2b280,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2 + 0.2; // Tilt the rings
        currentPlanetGroup.add(ringMesh);
    }

    scene.add(currentPlanetGroup);

    // Reset camera for better view of different sized planets
    camera.position.z = data.size * 3 + 2;
    controls.update();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    if (currentPlanetGroup) {
        // Slowly rotate the planet
        currentPlanetGroup.rotation.y += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init3D);