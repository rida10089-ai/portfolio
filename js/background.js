// js/background.js

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let w, h;

function initCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    initCanvas();
    createParticles();
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        // Base velocity
        this.vx = (Math.random() * 0.5) - 0.25;
        this.vy = (Math.random() * 0.5) - 0.25;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
    }

    update(gravityLevel) {
        // Gravity effect on particle background
        // As gravity reaches 100, particles fall down slightly.
        // At 0 they float completely freely.
        const downwardForce = (gravityLevel / 100) * 0.2;
        this.vy += downwardForce * 0.05; // tiny acceleration

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y > h) this.reset();

        this.life++;
        if (this.life > this.maxLife) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        const alpha = Math.max(0, 1 - (this.life / this.maxLife));
        ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`; // Cyber Silver
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    particles = [];
    const numParticles = Math.floor((w * h) / 10000); 
    for(let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);
    
    // Get gravity from App global (guaranteed to exist via main.js)
    const gLevel = window.App ? window.App.gravityLevel : 100;

    particles.forEach(p => {
        p.update(gLevel);
        p.draw();
    });
    
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    createParticles();
    animate();
});
