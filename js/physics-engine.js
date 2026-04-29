// js/physics-engine.js

document.addEventListener('DOMContentLoaded', () => {

    const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Composite, Events } = Matter;

    /**
     * Helper to initialize a Matter.js scene in a specific DOM container
     * It parses elements with a specific class, turns them into physical bodies,
     * and maps them back to custom DOM elements for rendering.
     */
    function createPhysicsScene(containerId, htmlItemSelector, renderDOMType) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const engine = Engine.create();
        const world = engine.world;
        
        // Default Earth Gravity
        engine.world.gravity.y = 1;

        // Create Boundaries
        const thickness = 60;
        const ground = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true });
        const leftWall = Bodies.rectangle(0 - thickness / 2, height / 2, thickness, height * 2, { isStatic: true });
        const rightWall = Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, { isStatic: true });
        const ceiling = Bodies.rectangle(width / 2, 0 - thickness / 2, width, thickness, { isStatic: true });
        
        World.add(world, [ground, leftWall, rightWall, ceiling]);

        // Parse HTML data
        const dataElements = container.querySelectorAll(htmlItemSelector);
        const domBodies = [];

        // Distribute starting X positions evenly
        const gap = width / (dataElements.length + 1);

        dataElements.forEach((el, index) => {
            let body, domWrapper;
            
            const startX = gap * (index + 1);
            const startY = height / 4 + Math.random() * 50;

            if (renderDOMType === 'book') {
                const w = 150;
                const h = 220;
                const title = el.getAttribute('data-title');
                const color = el.getAttribute('data-color') || '#8B00FF';
                
                body = Bodies.rectangle(startX, startY, w, h, {
                    restitution: 0.5,
                    friction: 0.1,
                    density: 0.05
                });
                
                domWrapper = document.createElement('div');
                domWrapper.className = 'matter-book';
                domWrapper.innerHTML = `<span>${title}</span>`;
                domWrapper.style.width = w + 'px';
                domWrapper.style.height = h + 'px';
                domWrapper.style.background = `linear-gradient(135deg, ${color}, #1A1A2E)`;
                domWrapper.style.border = `1px solid ${color}`;
                domWrapper.style.boxShadow = `0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px ${color}`;

            } else if (renderDOMType === 'tech') {
                const radius = 50;
                const label = el.getAttribute('data-label');
                const iconClass = el.getAttribute('data-icon');
                
                // Chamfered properties simulate a softer polygon
                body = Bodies.circle(startX, startY, radius, {
                    restitution: 0.8,
                    friction: 0.05,
                    density: 0.01,
                    frictionAir: 0.05 // Air friction so it floats down softly
                });
                
                domWrapper = document.createElement('div');
                domWrapper.className = 'matter-tech';
                domWrapper.innerHTML = `<i class="${iconClass}"></i><span>${label}</span>`;
                domWrapper.style.width = (radius*2) + 'px';
                domWrapper.style.height = (radius*2) + 'px';
                domWrapper.style.borderRadius = '50%';
                domWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                domWrapper.style.backdropFilter = 'blur(5px)';
                domWrapper.style.border = '1px solid var(--text-muted)';
            }
            
            if(body && domWrapper) {
                // Styling base for DOM
                domWrapper.style.position = 'absolute';
                domWrapper.style.display = 'flex';
                domWrapper.style.flexDirection = 'column';
                domWrapper.style.justifyContent = 'center';
                domWrapper.style.alignItems = 'center';
                domWrapper.style.textAlign = 'center';
                domWrapper.style.padding = '10px';
                domWrapper.style.color = '#fff';
                domWrapper.style.fontFamily = "'Inter', sans-serif";
                domWrapper.style.cursor = 'grab';
                domWrapper.style.transformOrigin = 'center center';
                // Initially center it perfectly via top left 0 0 offset
                domWrapper.style.top = '0';
                domWrapper.style.left = '0';
                domWrapper.style.marginLeft = -(body.bounds.max.x - body.bounds.min.x)/2 + 'px';
                domWrapper.style.marginTop = -(body.bounds.max.y - body.bounds.min.y)/2 + 'px';

                container.appendChild(domWrapper);
                World.add(world, body);
                
                domBodies.push({
                    body: body,
                    elem: domWrapper
                });
            }
        });

        // Add mouse control
        const mouse = Mouse.create(container);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        World.add(world, mouseConstraint);

        // Run Engine sync independently
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Sync DOM elements with Matter bodies during tick
        Events.on(engine, 'afterUpdate', function() {
            domBodies.forEach((item) => {
                const {x, y} = item.body.position;
                item.elem.style.transform = `translate(${x}px, ${y}px) rotate(${item.body.angle}rad)`;
            });
        });

        // Handle Resize boundary adjustment
        window.addEventListener('resize', () => {
            const newW = container.clientWidth;
            const newH = container.clientHeight;
            // Easiest resize is to reposition static bodies
            Matter.Body.setPosition(ground, { x: newW/2, y: newH + thickness / 2 });
            // For walls, we might need new bodies depending on changes. Right now static.
            Matter.Body.setPosition(rightWall, { x: newW + thickness / 2, y: newH / 2 });
        });

        return engine;
    }

    // Initialize scenes
    const bookshelfEngine = createPhysicsScene('bookshelf-scene', '.book-element', 'book');
    const techEngine = createPhysicsScene('tech-scene', '.tech-item', 'tech');

    // Link global gravity slider to these engines
    if(window.App) {
        window.App.subscribeGravity((level) => {
            const mappedGravity = (level / 100); // 0 to 1
            if(bookshelfEngine) {
                // To simulate pure zero-G float, we set gravity to 0. 
                // Setting it mildly negative at level 0 so they drift up slightly.
                bookshelfEngine.world.gravity.y = level === 0 ? -0.05 : mappedGravity;
            }
            if(techEngine) {
                techEngine.world.gravity.y = level === 0 ? -0.05 : mappedGravity;
            }
        });
    }

});
