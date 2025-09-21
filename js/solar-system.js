class SolarSystem {
    constructor() {
        console.log('[SolarSystem] Constructor called');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Animation properties
        this.animationSpeed = 1;
        this.time = 0;
        this.paused = false;
        
        // Scene objects
        this.sun = null;
        this.planets = {};
        this.moons = {};
        this.asteroidBelt = null;
        this.starField = null;
        this.orbitalPaths = [];
        this.planetLabels = [];
        
        // UI state
        this.showLabels = true;
        this.showOrbits = true;
        this.selectedObject = null;
        
        // Clickable objects for raycasting
        this.clickableObjects = [];
        
        console.log('[SolarSystem] About to call init()');
        this.init();
        console.log('[SolarSystem] Constructor completed');
    }
    
    init() {
        try {
            console.log('[SolarSystem] Starting initialization...');
            
            // Check if THREE.js is available
            if (typeof THREE === 'undefined') {
                throw new Error('THREE.js is not loaded');
            }
            
            console.log('[SolarSystem] THREE.js loaded, version:', THREE.REVISION);
            
            console.log('[SolarSystem] Creating scene...');
            this.createScene();
            console.log('[SolarSystem] Scene created successfully');
            
            console.log('[SolarSystem] Creating lighting...');
            this.createLighting();
            console.log('[SolarSystem] Lighting created successfully');
            
            console.log('[SolarSystem] Creating star field...');
            this.createStarField();
            console.log('[SolarSystem] Star field created successfully');
            
            console.log('[SolarSystem] Creating sun...');
            this.createSun();
            console.log('[SolarSystem] Sun created successfully');
            
            console.log('[SolarSystem] Creating planets...');
            this.createPlanets();
            console.log('[SolarSystem] Planets created successfully');
            
            console.log('[SolarSystem] Creating asteroid belt...');
            this.createAsteroidBelt();
            console.log('[SolarSystem] Asteroid belt created successfully');
            
            // Debug info to verify versions and control availability
            console.log('[SolarSystem] Has THREE.OrbitControls =', !!(THREE && THREE.OrbitControls));
            console.log('[SolarSystem] Has window.OrbitControls =', typeof window !== 'undefined' ? !!window.OrbitControls : false);
            
            console.log('[SolarSystem] Setting up controls...');
            this.setupControls();
            console.log('[SolarSystem] Controls setup successfully');
            
            console.log('[SolarSystem] Setting up event listeners...');
            this.setupEventListeners();
            console.log('[SolarSystem] Event listeners setup successfully');
            
            console.log('[SolarSystem] Setting up UI...');
            this.setupUI();
            console.log('[SolarSystem] UI setup successfully');
            
            console.log('[SolarSystem] Starting animation loop...');
            this.animate();
            console.log('[SolarSystem] Animation loop started successfully');
            
            console.log('[SolarSystem] Initialization complete!');
            
            // Hide loading screen immediately after successful initialization
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                console.log('[SolarSystem] Loading screen hidden - Solar System ready!');
            }
            
        } catch (error) {
            console.error('[SolarSystem] Initialization failed:', error);
            
            // Show error message and hide loading screen
            const loadingContent = document.querySelector('.loading-content h2');
            if (loadingContent) {
                loadingContent.textContent = 'Error loading Solar System: ' + error.message;
                loadingContent.style.color = '#ff6b6b';
            }
            
            // Hide loading screen even on error after showing the error message
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
            }, 3000);
        }
    }
    
    createScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 50, 100);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('solar-system'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    createLighting() {
        // Ambient light for subtle illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
        
        // Point light from the sun
        this.sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
    }
    
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Boost star visibility for small screens (mobile/tablet)
        let starSize = 0.5, starOpacity = 0.8;
        if (window.innerWidth < 900) {
            starSize = 1.2; // larger stars for mobile
            starOpacity = 1.0; // brighter
        }
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: starSize,
            transparent: true,
            opacity: starOpacity
        });
        
        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
    }
    
    createSun() {
        const sunData = CELESTIAL_DATA.sun;
        
        // Main sun sphere
        const sunGeometry = new THREE.SphereGeometry(sunData.displayRadius, 64, 64);
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(sunData.color) },
                intensity: { value: 1.5 }
            },
            vertexShader: SunShaders.vertex,
            fragmentShader: SunShaders.fragment
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = { type: 'sun', data: sunData };
        this.scene.add(this.sun);
        this.clickableObjects.push(this.sun);
        
        // Corona effect
        const coronaGeometry = new THREE.SphereGeometry(sunData.displayRadius * 1.5, 32, 32);
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffa500) },
                opacity: { value: 0.3 }
            },
            vertexShader: CoronaShaders.vertex,
            fragmentShader: CoronaShaders.fragment,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.sun.add(corona);
        
        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(sunData.displayRadius * 2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffaa00) },
                opacity: { value: 0.1 }
            },
            vertexShader: AtmosphereShaders.vertex,
            fragmentShader: AtmosphereShaders.fragment,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
    }
    
    createPlanets() {
        Object.entries(CELESTIAL_DATA.planets).forEach(([key, planetData]) => {
            // Create planet group for orbital mechanics
            const planetGroup = new THREE.Group();
            planetGroup.userData = { type: 'planetGroup', planetKey: key };
            
            // Planet geometry and material (no external textures for fast loading)
            const planetGeometry = new THREE.SphereGeometry(planetData.displayRadius, 32, 32);
            const planetMaterial = new THREE.MeshPhongMaterial({ 
                color: planetData.color,
                shininess: 10,
                emissive: new THREE.Color(planetData.color).multiplyScalar(0.2)
            });
            
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.position.x = planetData.displayDistance;
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.userData = { type: 'planet', data: planetData, planetKey: key };
            
            planetGroup.add(planet);
            this.scene.add(planetGroup);
            
            this.planets[key] = {
                group: planetGroup,
                mesh: planet,
                data: planetData,
                angle: Math.random() * Math.PI * 2 // Random starting position
            };
            
            this.clickableObjects.push(planet);
            
            // Create atmosphere for Earth
            if (key === 'earth') {
                const atmosphereGeometry = new THREE.SphereGeometry(planetData.displayRadius * 1.05, 32, 32);
                const atmosphereMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        color: { value: new THREE.Color(0x87ceeb) },
                        opacity: { value: 0.3 }
                    },
                    vertexShader: AtmosphereShaders.vertex,
                    fragmentShader: AtmosphereShaders.fragment,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    side: THREE.BackSide
                });
                
                const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
                planet.add(atmosphere);
            }
            
            // Create Saturn's rings
            if (key === 'saturn') {
                this.createSaturnRings(planet, planetData.displayRadius);
            }
            
            // Create orbital path
            this.createOrbitalPath(planetData.displayDistance);
            
            // Create moons
            if (planetData.moons) {
                this.createMoons(planet, planetData.moons, key);
            }
        });
    }
    
    createSaturnRings(planet, planetRadius) {
        const ringGeometry = new THREE.RingGeometry(
            planetRadius * 1.2,
            planetRadius * 2.2,
            64
        );
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }
    
    createMoons(parentPlanet, moonsData, planetKey) {
        Object.entries(moonsData).forEach(([moonKey, moonData]) => {
            const moonGroup = new THREE.Group();
            
            const moonGeometry = new THREE.SphereGeometry(moonData.displayRadius, 16, 16);
            const moonMaterial = new THREE.MeshPhongMaterial({ 
                color: moonData.color,
                shininess: 0
            });
            
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.x = moonData.displayDistance;
            moon.castShadow = true;
            moon.receiveShadow = true;
            moon.userData = { type: 'moon', data: moonData };
            
            moonGroup.add(moon);
            parentPlanet.add(moonGroup);
            
            this.moons[`${planetKey}_${moonKey}`] = {
                group: moonGroup,
                mesh: moon,
                data: moonData,
                angle: 0
            };
            
            this.clickableObjects.push(moon);
        });
    }
    
    createOrbitalPath(radius) {
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.7,
            linewidth: 2
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.visible = this.showOrbits;
        this.scene.add(orbit);
        this.orbitalPaths.push(orbit);
    }
    
    createAsteroidBelt() {
        const asteroidGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const asteroidMaterial = new THREE.MeshPhongMaterial({ 
            color: ASTEROID_BELT.color 
        });
        
        this.asteroidBelt = new THREE.InstancedMesh(
            asteroidGeometry,
            asteroidMaterial,
            ASTEROID_BELT.particleCount
        );
        
        const matrix = new THREE.Matrix4();
        
        for (let i = 0; i < ASTEROID_BELT.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = ASTEROID_BELT.innerRadius + 
                          Math.random() * (ASTEROID_BELT.outerRadius - ASTEROID_BELT.innerRadius);
            const height = (Math.random() - 0.5) * 2;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            matrix.setPosition(x, height, z);
            this.asteroidBelt.setMatrixAt(i, matrix);
        }
        
        this.scene.add(this.asteroidBelt);
    }
    
    setupControls() {
        // Support both legacy global and namespaced controls
        const ControlsCtor = (typeof THREE !== 'undefined' && THREE.OrbitControls)
            || (typeof window !== 'undefined' && window.OrbitControls)
            || null;

        if (!ControlsCtor) {
            console.warn('OrbitControls not found. Falling back to basic controls (zoom/orbit/pan).');
            // Provide a minimal fallback so users can still zoom/orbit
            this.controls = this.createBasicControls(this.camera, this.renderer.domElement);
            return;
        }

        this.controls = new ControlsCtor(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;
        
        // Enable touch controls for OrbitControls
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        
        // Add custom touch zoom support for better mobile experience
        this.addTouchZoomSupport(this.controls, this.renderer.domElement);
    }

    // Enhanced touch zoom support for OrbitControls
    addTouchZoomSupport(controls, domElement) {
        let touches = [];
        let lastTouchDistance = 0;
        let isTouchZooming = false;

        function getTouchDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function onTouchStart(e) {
            touches = Array.from(e.touches);
            
            if (touches.length === 2) {
                // Two finger touch - prepare for enhanced pinch zoom
                isTouchZooming = true;
                lastTouchDistance = getTouchDistance(touches[0], touches[1]);
                e.preventDefault(); // Prevent default zoom behavior
            }
        }

        function onTouchMove(e) {
            touches = Array.from(e.touches);
            
            if (touches.length === 2 && isTouchZooming) {
                // Handle enhanced pinch-to-zoom
                const currentDistance = getTouchDistance(touches[0], touches[1]);
                const distanceChange = currentDistance - lastTouchDistance;
                
                if (Math.abs(distanceChange) > 2) { // Threshold to prevent jitter
                    const zoomFactor = 1 + (distanceChange * 0.008); // Smooth zoom sensitivity
                    
                    // Get current camera distance
                    const currentDistance = controls.object.position.distanceTo(controls.target);
                    const newDistance = currentDistance / zoomFactor;
                    
                    // Apply zoom limits
                    const clampedDistance = THREE.MathUtils.clamp(
                        newDistance,
                        controls.minDistance,
                        controls.maxDistance
                    );
                    
                    // Calculate zoom direction
                    const direction = new THREE.Vector3()
                        .subVectors(controls.object.position, controls.target)
                        .normalize();
                    
                    // Set new camera position
                    controls.object.position.copy(controls.target)
                        .add(direction.multiplyScalar(clampedDistance));
                    
                    lastTouchDistance = currentDistance;
                    e.preventDefault();
                }
            }
        }

        function onTouchEnd(e) {
            touches = Array.from(e.touches);
            
            if (touches.length < 2) {
                isTouchZooming = false;
            }
        }

        // Add enhanced touch event listeners
        domElement.addEventListener('touchstart', onTouchStart, { passive: false });
        domElement.addEventListener('touchmove', onTouchMove, { passive: false });
        domElement.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    // Lightweight fallback when OrbitControls isn't available (offline/CDN blocked)
    createBasicControls(camera, domElement) {
        const controls = {
            target: new THREE.Vector3(0, 0, 0),
            enableDamping: true,
            dampingFactor: 0.08,
            minDistance: 2,
            maxDistance: 500,
            _spherical: new THREE.Spherical(),
            _sphericalCurrent: new THREE.Spherical(),
            _rotateSpeed: 0.005,
            _zoomScale: 1.1,
            _rotating: false,
            _panning: false,
            update: () => {
                // clamp
                controls._spherical.radius = THREE.MathUtils.clamp(
                    controls._spherical.radius,
                    controls.minDistance,
                    controls.maxDistance
                );
                controls._spherical.phi = THREE.MathUtils.clamp(
                    controls._spherical.phi,
                    0.001,
                    Math.PI - 0.001
                );

                // damping interpolation
                const d = controls.enableDamping ? controls.dampingFactor : 1.0;
                controls._sphericalCurrent.theta += (controls._spherical.theta - controls._sphericalCurrent.theta) * d;
                controls._sphericalCurrent.phi   += (controls._spherical.phi   - controls._sphericalCurrent.phi)   * d;
                controls._sphericalCurrent.radius+= (controls._spherical.radius- controls._sphericalCurrent.radius)* d;

                const offset = new THREE.Vector3().setFromSpherical(controls._sphericalCurrent);
                camera.position.copy(controls.target).add(offset);
                camera.lookAt(controls.target);
            }
        };

        // initialize spherical from camera
        const offset = new THREE.Vector3().copy(camera.position).sub(controls.target);
        controls._spherical.setFromVector3(offset);
        controls._sphericalCurrent.copy(controls._spherical);

        // helpers
        function onWheel(e) {
            e.preventDefault();
            const factor = controls._zoomScale;
            if (e.deltaY > 0) {
                controls._spherical.radius *= factor; // zoom out
            } else {
                controls._spherical.radius /= factor; // zoom in
            }
        }

        // Touch gesture variables for pinch-to-zoom
        let touches = [];
        let lastTouchDistance = 0;
        let isTouchZooming = false;

        function getTouchDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function onTouchStart(e) {
            e.preventDefault();
            touches = Array.from(e.touches);
            
            if (touches.length === 2) {
                // Two finger touch - prepare for pinch zoom
                isTouchZooming = true;
                lastTouchDistance = getTouchDistance(touches[0], touches[1]);
                controls._rotating = false;
                controls._panning = false;
            } else if (touches.length === 1) {
                // Single finger touch - prepare for rotation
                isTouchZooming = false;
                controls._rotating = true;
                startX = touches[0].clientX;
                startY = touches[0].clientY;
            }
        }

        function onTouchMove(e) {
            e.preventDefault();
            touches = Array.from(e.touches);
            
            if (touches.length === 2 && isTouchZooming) {
                // Handle pinch-to-zoom
                const currentDistance = getTouchDistance(touches[0], touches[1]);
                const distanceChange = currentDistance - lastTouchDistance;
                
                if (Math.abs(distanceChange) > 1) { // Threshold to prevent jitter
                    const zoomFactor = 1 + (distanceChange * 0.01); // Adjust sensitivity
                    controls._spherical.radius /= zoomFactor;
                    lastTouchDistance = currentDistance;
                }
            } else if (touches.length === 1 && controls._rotating) {
                // Handle single finger rotation
                const dx = touches[0].clientX - startX;
                const dy = touches[0].clientY - startY;
                startX = touches[0].clientX;
                startY = touches[0].clientY;
                
                controls._spherical.theta -= dx * controls._rotateSpeed;
                controls._spherical.phi -= dy * controls._rotateSpeed;
            }
        }

        function onTouchEnd(e) {
            e.preventDefault();
            touches = Array.from(e.touches);
            
            if (touches.length < 2) {
                isTouchZooming = false;
            }
            if (touches.length === 0) {
                controls._rotating = false;
                controls._panning = false;
            }
        }

        let startX = 0, startY = 0;
        function onPointerDown(e) {
            if (e.button === 0) controls._rotating = true; // left
            if (e.button === 2) controls._panning = true;  // right
            startX = e.clientX; startY = e.clientY;
            domElement.setPointerCapture?.(e.pointerId);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        }

        function onPointerMove(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            startX = e.clientX; startY = e.clientY;

            if (controls._rotating) {
                controls._spherical.theta -= dx * controls._rotateSpeed;
                controls._spherical.phi   -= dy * controls._rotateSpeed;
            } else if (controls._panning) {
                // simple pan: translate target along camera's local axes
                const pan = new THREE.Vector3(-dx, dy, 0);
                pan.multiplyScalar(controls._spherical.radius * 0.001);
                // map from screen to world using camera basis
                const xAxis = new THREE.Vector3();
                const yAxis = new THREE.Vector3();
                camera.updateMatrixWorld();
                xAxis.setFromMatrixColumn(camera.matrix, 0);
                yAxis.setFromMatrixColumn(camera.matrix, 1);
                controls.target.addScaledVector(xAxis, pan.x);
                controls.target.addScaledVector(yAxis, pan.y);
            }
        }

        function onPointerUp(e) {
            controls._rotating = false;
            controls._panning = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            domElement.releasePointerCapture?.(e.pointerId);
        }

        function onContextMenu(e) { e.preventDefault(); }

        // Ensure the canvas allows pointer gestures (important for some browsers)
        try { domElement.style.touchAction = 'none'; } catch (e) {}
        domElement.addEventListener('wheel', onWheel, { passive: false });
        // Fallback: also listen on document to catch wheels when focus isn't on canvas
        document.addEventListener('wheel', onWheel, { passive: false });
        
        // Add touch event listeners for mobile/tablet support
        domElement.addEventListener('touchstart', onTouchStart, { passive: false });
        domElement.addEventListener('touchmove', onTouchMove, { passive: false });
        domElement.addEventListener('touchend', onTouchEnd, { passive: false });
        
        // Keyboard zoom support (+/-)
        function onKeyDown(e) {
            if (e.key === '+' || e.key === '=') { controls._spherical.radius /= controls._zoomScale; }
            if (e.key === '-' || e.key === '_') { controls._spherical.radius *= controls._zoomScale; }
        }
        window.addEventListener('keydown', onKeyDown);
        domElement.addEventListener('pointerdown', onPointerDown);
        domElement.addEventListener('contextmenu', onContextMenu);

        return controls;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events for object selection
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }
    
    setupUI() {
        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = `${this.animationSpeed}x`;
        });
        
        // Toggle buttons
        // document.getElementById('toggle-labels').addEventListener('click', () => {
        //     this.showLabels = !this.showLabels;
        //     this.updateLabelsVisibility();
        // });
        
        document.getElementById('toggle-orbits').addEventListener('click', () => {
            this.showOrbits = !this.showOrbits;
            this.orbitalPaths.forEach(orbit => orbit.visible = this.showOrbits);
        });
        
        document.getElementById('close-info').addEventListener('click', () => {
            this.hideInfoPanel();
        });
        
        // Setup panel toggle functionality
        this.setupPanelToggle();
        
        // Setup draggable UI panel
        this.setupDraggablePanel();
    }
    
    setupPanelToggle() {
        const toggleBtn = document.getElementById('toggle-panel');
        const panelContent = document.getElementById('panel-content');
        const panel = document.getElementById('ui-panel');
        
        if (!toggleBtn || !panelContent || !panel) return;
        
        let isCollapsed = false;
        
        toggleBtn.addEventListener('click', (e) => {
            // Prevent dragging when clicking the toggle button
            e.stopPropagation();
            
            isCollapsed = !isCollapsed;
            
            if (isCollapsed) {
                // Collapse the panel
                panelContent.classList.add('collapsed');
                panel.classList.add('collapsed');
                toggleBtn.textContent = '+';
                toggleBtn.title = 'Expand';
            } else {
                // Expand the panel
                panelContent.classList.remove('collapsed');
                panel.classList.remove('collapsed');
                toggleBtn.textContent = '−';
                toggleBtn.title = 'Minimize';
            }
        });
    }
    
    setupDraggablePanel() {
        const panel = document.getElementById('ui-panel');
        const header = document.getElementById('ui-panel-header');
        
        if (!panel || !header) return;
        
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        // Mouse events
        header.addEventListener('mousedown', (e) => {
            // Don't start dragging if clicking on the toggle button
            if (e.target.id === 'toggle-panel') return;
            
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            header.classList.add('dragging');
            panel.classList.add('dragging');
            
            // Prevent text selection
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            // Keep panel within viewport bounds
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            panel.style.left = clampedX + 'px';
            panel.style.top = clampedY + 'px';
            panel.style.right = 'auto'; // Override CSS right positioning
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                header.classList.remove('dragging');
                panel.classList.remove('dragging');
            }
        });
        
        // Touch events for mobile support
        header.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = panel.getBoundingClientRect();
            dragOffset.x = touch.clientX - rect.left;
            dragOffset.y = touch.clientY - rect.top;
            
            header.classList.add('dragging');
            panel.classList.add('dragging');
            
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const x = touch.clientX - dragOffset.x;
            const y = touch.clientY - dragOffset.y;
            
            // Keep panel within viewport bounds
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            panel.style.left = clampedX + 'px';
            panel.style.top = clampedY + 'px';
            panel.style.right = 'auto';
            
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                header.classList.remove('dragging');
                panel.classList.remove('dragging');
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.clickableObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectObject(object);
        } else {
            this.hideInfoPanel();
        }
    }
    
    onMouseMove(event) {
        // Update mouse position for potential hover effects
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    selectObject(object) {
        this.selectedObject = object;
        this.showInfoPanel(object.userData.data);
    }
    
    showInfoPanel(data) {
        const infoPanel = document.getElementById('info-panel');
        const title = document.getElementById('info-title');
        const description = document.getElementById('info-description');
        const stats = document.getElementById('info-stats');
        
        title.textContent = data.name;
        description.textContent = data.description;
        
        stats.innerHTML = '';
        Object.entries(data.stats).forEach(([key, value]) => {
            const statDiv = document.createElement('div');
            statDiv.innerHTML = `
                <span class="stat-label">${key}:</span>
                <span class="stat-value">${value}</span>
            `;
            stats.appendChild(statDiv);
        });
        
        infoPanel.classList.remove('hidden');
    }
    
    hideInfoPanel() {
        document.getElementById('info-panel').classList.add('hidden');
        this.selectedObject = null;
    }
    
    updateLabelsVisibility() {
        // Implementation for planet labels would go here
        // For now, we'll skip this as it requires DOM manipulation for 3D labels
    }
    
    resetCamera() {
        this.camera.position.set(0, 50, 100);
        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01 * this.animationSpeed;
        
        // Update sun shader
        if (this.sun) {
            this.sun.material.uniforms.time.value = this.time;
            this.sun.children.forEach(child => {
                if (child.material.uniforms && child.material.uniforms.time) {
                    child.material.uniforms.time.value = this.time;
                }
            });
            
            // Rotate sun
            this.sun.rotation.y += 0.005 * this.animationSpeed;
        }
        
        // Update planetary orbits and rotations
        Object.entries(this.planets).forEach(([key, planet]) => {
            const data = planet.data;
            
            // Orbital motion with slower speeds for inner planets
            let speedMultiplier = SCALE_FACTORS.speed;
            if (key === 'mercury' || key === 'venus' || key === 'earth' || key === 'mars') {
                speedMultiplier *= 0.3; // Make inner planets 70% slower
            }
            
            const orbitalSpeed = (365.25 / data.orbitalPeriod) * 0.01 * speedMultiplier;
            planet.angle += orbitalSpeed * this.animationSpeed;
            
            planet.group.rotation.y = planet.angle;
            
            // Planetary rotation
            const rotationSpeed = (1 / data.rotationPeriod) * 0.1;
            planet.mesh.rotation.y += rotationSpeed * this.animationSpeed;
        });
        
        // Update moon orbits
        Object.entries(this.moons).forEach(([key, moon]) => {
            const data = moon.data;
            const orbitalSpeed = (27.3 / data.orbitalPeriod) * 0.05;
            moon.angle += orbitalSpeed * this.animationSpeed;
            moon.group.rotation.y = moon.angle;
        });
        
        // Rotate asteroid belt slowly
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.001 * this.animationSpeed;
        }
        
        // Subtle starfield rotation
        if (this.starField) {
            this.starField.rotation.y += 0.0001 * this.animationSpeed;
        }
        
        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the page loads
function initializeSolarSystem() {
    console.log('[Main] Attempting to initialize Solar System...');
    
    try {
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js library failed to load');
        }
        
        if (typeof CELESTIAL_DATA === 'undefined') {
            throw new Error('Celestial data not loaded');
        }
        
        if (typeof SunShaders === 'undefined') {
            throw new Error('Shaders not loaded');
        }
        
        console.log('[Main] All dependencies verified, creating SolarSystem instance...');
        const solarSystem = new SolarSystem();
        console.log('[Main] SolarSystem instance created successfully:', solarSystem);
        
    } catch (error) {
        console.error('[Main] Failed to initialize Solar System:', error);
        console.error('[Main] Error stack:', error.stack);
        
        // Show error in loading screen
        const loadingContent = document.querySelector('.loading-content h2');
        if (loadingContent) {
            loadingContent.textContent = 'Initialization Error: ' + error.message;
            loadingContent.style.color = '#ff6b6b';
        }
        
        // Hide loading screen after showing error
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 5000);
    }
}

// Try multiple initialization approaches
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM loaded, waiting for scripts...');
    
    // First attempt after a short delay
    setTimeout(() => {
        console.log('[Main] First initialization attempt...');
        initializeSolarSystem();
    }, 1000);
    
    // Backup attempt if first fails
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            console.log('[Main] Loading screen still visible, trying backup initialization...');
            initializeSolarSystem();
        }
    }, 3000);
});
