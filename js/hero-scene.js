// js/hero-scene.js

document.addEventListener('DOMContentLoaded', () => {
    
    const container = document.getElementById('hero-3d-container');
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    
    // Transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Fit to container width, fixed height matching CSS
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = 30;
    camera.lookAt(0, 0, 0);

    // MESH - Gravity Well Geometry
    // We'll create a wireframe plane altered to look like a gravity well
    const planeGeo = new THREE.PlaneGeometry(150, 150, 40, 40);
    
    // Distort geometry center to create a 'well'
    const positionAttribute = planeGeo.attributes.position;
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        // Distance from center
        const dist = Math.sqrt(x*x + y*y);
        
        // Depth formula - exponential drop near center
        let z = 0;
        if (dist < 40) {
            z = - (40 - dist) * 1.5;
        }
        
        positionAttribute.setZ(i, z);
    }
    
    planeGeo.computeVertexNormals();
    
    // Material with Electric Violet glow
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x8B00FF, 
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    
    const gravityWell = new THREE.Mesh(planeGeo, material);
    gravityWell.rotation.x = -Math.PI / 2; // Lay flat
    scene.add(gravityWell);

    // Orbiting particles inside the well
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    const orbitAngles = new Float32Array(particleCount);
    const orbitSpeeds = new Float32Array(particleCount);
    const orbitRadii = new Float32Array(particleCount);

    for(let i=0; i<particleCount; i++) {
        // Random assignments
        orbitAngles[i] = Math.random() * Math.PI * 2;
        orbitRadii[i] = Math.random() * 35 + 2; 
        orbitSpeeds[i] = (Math.random() * 0.05 + 0.01) * Math.sign(Math.random() - 0.5);
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x00ffff, // Cyber Cyan accent
        transparent: true,
        opacity: 0.8
    });
    const particleMesh = new THREE.Points(particlesGeo, pMaterial);
    scene.add(particleMesh);

    // RESIZE HANDLING
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // Interaction with Global Gravity Control
    let currentGravityRatio = 1.0;
    
    // Register up callback to main App
    if(window.App) {
        window.App.subscribeGravity((level) => {
            // level is 0..100
            currentGravityRatio = level / 100;
            // Morph the mesh based on gravity?
            // For simplicity, we adjust rotation speed or well depth.
        });
    }

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        // Spin the whole well slowly
        gravityWell.rotation.z -= 0.1 * delta * (currentGravityRatio + 0.1); 

        // Update orbiting particles
        const positions = particleMesh.geometry.attributes.position.array;
        
        for(let i=0; i<particleCount; i++) {
            orbitAngles[i] += orbitSpeeds[i] * (currentGravityRatio * 2 + 0.2); // Faster near 1G
            
            // Adjust radius based on gravity (pulls tighter if higher gravity)
            const targetedRadius = orbitRadii[i] * (0.5 + currentGravityRatio * 0.5);
            
            const x = Math.cos(orbitAngles[i]) * targetedRadius;
            const z = Math.sin(orbitAngles[i]) * targetedRadius;
            
            // Depth depends on current radius
            let y = 0;
            if (targetedRadius < 40) {
                y = - (40 - targetedRadius) * 1.5; 
                y *= currentGravityRatio; // Shallower in 0G
            }

            positions[i*3] = x;
            positions[i*3 + 1] = y;
            positions[i*3 + 2] = z;
        }
        
        particleMesh.geometry.attributes.position.needsUpdate = true;
        
        // Gentle bobbing of the whole group
        scene.position.y = Math.sin(Date.now() * 0.001) * 2;

        renderer.render(scene, camera);
    }
    
    animate();
});
