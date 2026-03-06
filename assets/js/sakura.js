const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

let width, height, dpr;
let petals = [];      
let cursorTrail = []; 
let petalCount;

// --- 1. 圖片設定 ---
const imageUrls = [
    './assets/img/sakura/sakura1.svg', 
    './assets/img/sakura/sakura2.svg', 
    './assets/img/sakura/sakura3.svg', 
    './assets/img/sakura/sakura4.svg', 
    './assets/img/sakura/sakura5.svg'
];

const petalImages = imageUrls.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

const mouse = { x: -500, y: -500 };

// --- 2. 類別定義 (必須搬到 initialization 之前) ---
class Petal {
    constructor(x, y, isTrail = false) {
        this.isTrail = isTrail;
        this.init(x, y);
    }

    init(x, y) {
        this.x = x !== undefined ? x : Math.random() * width;
        this.y = y !== undefined ? y : Math.random() * height;
        this.img = petalImages[Math.floor(Math.random() * petalImages.length)];
        
        const sizeBase = width < 768 ? 10 : 15;
        this.size = Math.random() * 10 + sizeBase; 
        
        this.life = 1.0;
        this.opacity = this.isTrail ? 1.0 : (Math.random() * 0.4 + 0.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02; 

        if (this.isTrail) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 1.5 + 0.2;
            this.vx = Math.cos(angle) * force;
            this.vy = Math.sin(angle) * force;
            this.friction = 0.97;
        } else {
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = Math.random() * 0.5 + 0.3; 
            this.offset = Math.random() * Math.PI * 2; 
        }
    }

    update() {
        if (this.isTrail) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += 0.02; 
            this.life -= 0.01; 
        } else {
            this.offset += 0.005;
            this.x += this.vx + Math.sin(this.offset) * 0.4;
            this.y += this.vy;

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }

            if (this.y > height + 20) {
                this.y = -20;
                this.x = Math.random() * width;
            }
        }
        this.rotation += this.spin;
    }

    draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.isTrail ? this.life : this.opacity;

        if (this.img.complete && this.img.naturalWidth !== 0) {
            ctx.drawImage(this.img, -this.size/2, -this.size/2, this.size, this.size);
        } else {
            // 備用粉色橢圓（若圖片路徑不對，至少會看到粉點飄動）
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size/2, this.size/3, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FFC0CB';
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- 3. 執行 initialization ---
function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    petalCount = width < 768 ? 10 : 25;

    petals = [];
    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize(); // 現在這裡調用 resize，上面的 Petal 已經準備好了

// --- 4. 交互與動畫 ---
function handleMove(x, y) {
    mouse.x = x;
    mouse.y = y;
    const chance = width < 768 ? 0.2 : 0.3;
    if (Math.random() < chance) {
        cursorTrail.push(new Petal(x, y, true));
    }
}

window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
}, { passive: true });

function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => { p.update(); p.draw(); });
    for (let i = cursorTrail.length - 1; i >= 0; i--) {
        cursorTrail[i].update();
        cursorTrail[i].draw();
        if (cursorTrail[i].life <= 0) cursorTrail.splice(i, 1);
    }
    requestAnimationFrame(animate);
}

animate();