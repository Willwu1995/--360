const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startupScreen = document.getElementById('startupScreen');
const effectOverlay = document.getElementById('effectOverlay');
const messageText = document.getElementById('messageText');

let gameRunning = false;
let gamePaused = false;
let player = { x: 400, y: 500, width: 40, height: 40, speed: 5 };
let obstacles = [];
let keys = {};
let gameLoop;

const characters = [
    { char: '佺', effect: 'lightning', message: '掌门作法', color: 'red', word: '涨' },
    { char: '渊', effect: 'storm', message: '空头降临', color: 'green', word: '跑' },
    { char: '斌', effect: 'celebration', message: '主任驾到', color: 'red', word: '發' },
    { char: '政', effect: 'trash', message: '垃圾三门', color: 'green', word: '拉' }
];

function startGame() {
    startupScreen.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop = setInterval(updateGame, 1000/60);
}

function initializeGame() {
    obstacles = [];
    for (let i = 0; i < 8; i++) {
        createObstacle();
    }
}

function createObstacle() {
    const charData = characters[Math.floor(Math.random() * characters.length)];
    obstacles.push({
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 200),
        width: 50,
        height: 50,
        char: charData.char,
        effect: charData.effect,
        message: charData.message,
        color: charData.color,
        word: charData.word
    });
}

function updateGame() {
    if (!gameRunning || gamePaused) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    obstacles.forEach((obstacle, index) => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obstacle.char, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 + 8);
        
        if (checkCollision(player, obstacle)) {
            triggerEffect(obstacle);
            obstacles.splice(index, 1);
            setTimeout(() => createObstacle(), 2000);
        }
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function triggerEffect(obstacle) {
    gamePaused = true;
    
    effectOverlay.className = 'effect-overlay ' + obstacle.effect;
    
    messageText.innerHTML = obstacle.message + '<br><span class="' + obstacle.color + '-text" style="font-size: 48px;">' + obstacle.word + '</span>';
    messageText.style.display = 'block';
    
    createParticles(obstacle.effect);
    
    setTimeout(() => {
        gamePaused = false;
        effectOverlay.className = 'effect-overlay';
        messageText.style.display = 'none';
    }, 2000);
}

function createParticles(effectType) {
    const effectOverlay = document.getElementById('effectOverlay');
    
    switch(effectType) {
        case 'lightning':
            createLightningEffect();
            break;
        case 'storm':
            createStormEffect();
            break;
        case 'celebration':
            createCelebrationEffect();
            break;
        case 'trash':
            createTrashEffect();
            break;
    }
}

function createLightningEffect() {
    const effectOverlay = document.getElementById('effectOverlay');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = Math.random() * window.innerWidth + 'px';
            bolt.style.height = Math.random() * 300 + 200 + 'px';
            effectOverlay.appendChild(bolt);
            
            document.body.style.animation = 'shake 0.5s';
            
            setTimeout(() => {
                bolt.remove();
                document.body.style.animation = '';
            }, 300);
        }, i * 200);
    }
}

function createStormEffect() {
    const effectOverlay = document.getElementById('effectOverlay');
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const rain = document.createElement('div');
            rain.className = 'rain-particle';
            rain.style.left = Math.random() * window.innerWidth + 'px';
            rain.style.height = Math.random() * 50 + 30 + 'px';
            rain.style.animationDelay = Math.random() * 2 + 's';
            effectOverlay.appendChild(rain);
            
            setTimeout(() => {
                rain.remove();
            }, 2000);
        }, i * 50);
    }
    
    let windDirection = 1;
    const windInterval = setInterval(() => {
        document.body.style.transform = `translateX(${windDirection * 10}px)`;
        windDirection *= -1;
    }, 100);
    
    setTimeout(() => {
        clearInterval(windInterval);
        document.body.style.transform = '';
    }, 2000);
}

function createCelebrationEffect() {
    const effectOverlay = document.getElementById('effectOverlay');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 1 + 's';
            effectOverlay.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
    
    for (let i = 0; i < 10; i++) {
        const balloon = document.createElement('div');
        balloon.style.position = 'absolute';
        balloon.style.width = '20px';
        balloon.style.height = '25px';
        balloon.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = Math.random() * window.innerWidth + 'px';
        balloon.style.top = window.innerHeight + 'px';
        balloon.style.animation = `float-up ${Math.random() * 3 + 2}s ease-out`;
        balloon.style.zIndex = '150';
        effectOverlay.appendChild(balloon);
        
        setTimeout(() => {
            balloon.remove();
        }, 5000);
    }
}

function createTrashEffect() {
    const effectOverlay = document.getElementById('effectOverlay');
    const trashTypes = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#696969'];
    
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const trash = document.createElement('div');
            trash.className = 'trash-item';
            trash.style.left = Math.random() * window.innerWidth + 'px';
            trash.style.backgroundColor = trashTypes[Math.floor(Math.random() * trashTypes.length)];
            trash.style.width = Math.random() * 15 + 5 + 'px';
            trash.style.height = Math.random() * 15 + 5 + 'px';
            trash.style.animationDelay = Math.random() * 1 + 's';
            effectOverlay.appendChild(trash);
            
            setTimeout(() => {
                trash.remove();
            }, 2000);
        }, i * 100);
    }
    
    const dustCloud = document.createElement('div');
    dustCloud.style.position = 'absolute';
    dustCloud.style.top = '0';
    dustCloud.style.left = '0';
    dustCloud.style.width = '100%';
    dustCloud.style.height = '100%';
    dustCloud.style.background = 'radial-gradient(circle, rgba(139,69,19,0.3) 0%, transparent 70%)';
    dustCloud.style.animation = 'dust-cloud 2s ease-out';
    dustCloud.style.zIndex = '140';
    effectOverlay.appendChild(dustCloud);
    
    setTimeout(() => {
        dustCloud.remove();
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% { 
            top: 100vh; 
            transform: translateX(0) rotate(0deg); 
            opacity: 1; 
        }
        100% { 
            top: -20vh; 
            transform: translateX(${Math.random() * 200 - 100}px) rotate(360deg); 
            opacity: 0; 
        }
    }
    
    @keyframes dust-cloud {
        0% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 0.6; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(1.5); }
    }
`;
document.head.appendChild(style);

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});