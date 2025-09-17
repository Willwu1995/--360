const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startupScreen = document.getElementById('startupScreen');
const effectOverlay = document.getElementById('effectOverlay');
const messageText = document.getElementById('messageText');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let gameRunning = false;
let gamePaused = false;
let gameLoop;
let snake = [];
let dx = 0;
let dy = 0;
let foodX = 15;
let foodY = 15;
let score = 0;
let specialFood = null;
let specialFoodTimer = 0;

const specialCharacters = [
    { char: '佺', effect: 'lightning', message: '掌门作法', color: 'red', word: '涨' },
    { char: '渊', effect: 'storm', message: '空头降临', color: 'green', word: '跑' },
    { char: '斌', effect: 'celebration', message: '主任驾到', color: 'red', word: '發' },
    { char: '政', effect: 'trash', message: '垃圾三门', color: 'green', word: '拉' }
];

function startGame() {
    startupScreen.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop = setInterval(updateGame, 100);
}

function initializeGame() {
    snake = [
        {x: 10, y: 10}
    ];
    dx = 0;
    dy = 0;
    score = 0;
    specialFood = null;
    specialFoodTimer = 0;
    generateFood();
    updateScore();
}

function generateFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    for (let segment of snake) {
        if (segment.x === foodX && segment.y === foodY) {
            generateFood();
            return;
        }
    }
}

function generateSpecialFood() {
    const charData = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
    specialFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        char: charData.char,
        effect: charData.effect,
        message: charData.message,
        color: charData.color,
        word: charData.word
    };
    specialFoodTimer = 150;
}

function updateGame() {
    if (!gameRunning || gamePaused) return;
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        updateScore();
        generateFood();
        
        if (Math.random() < 0.3 && !specialFood) {
            generateSpecialFood();
        }
    } else {
        snake.pop();
    }
    
    if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        score += 50;
        updateScore();
        triggerEffect(specialFood);
        specialFood = null;
    }
    
    if (specialFood) {
        specialFoodTimer--;
        if (specialFoodTimer <= 0) {
            specialFood = null;
        }
    }
    
    drawGame();
}

function drawGame() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
    
    if (specialFood) {
        const alpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillRect(specialFood.x * gridSize, specialFood.y * gridSize, gridSize - 2, gridSize - 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(specialFood.char, 
            specialFood.x * gridSize + gridSize/2, 
            specialFood.y * gridSize + gridSize/2 + 5);
    }
}

function triggerEffect(specialFood) {
    gamePaused = true;
    
    effectOverlay.className = 'effect-overlay ' + specialFood.effect;
    
    showMessageWithTyping(specialFood.message, specialFood.color, specialFood.word);
    
    createParticles(specialFood.effect);
    
    setTimeout(() => {
        gamePaused = false;
        effectOverlay.className = 'effect-overlay';
        messageText.style.display = 'none';
    }, 2000);
}

function showMessageWithTyping(message, color, finalWord) {
    messageText.style.display = 'block';
    messageText.innerHTML = '';
    
    let charIndex = 0;
    const typingInterval = setInterval(() => {
        if (charIndex < message.length) {
            const currentText = message.substring(0, charIndex + 1);
            messageText.innerHTML = currentText + '<br><span class="' + color + '-text" style="font-size: 48px; opacity: 0;">' + finalWord + '</span>';
            charIndex++;
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                messageText.innerHTML = message + '<br><span class="' + color + '-text" style="font-size: 48px;">' + finalWord + '</span>';
            }, 200);
        }
    }, 150);
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
}

function createTrashEffect() {
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
}

function updateScore() {
    scoreElement.textContent = '分数: ' + score;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function restartGame() {
    gameOverElement.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop = setInterval(updateGame, 100);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.code) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});