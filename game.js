const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const SNAKE_COLOR = '#0f0';
const FOOD_COLOR = '#f00';
const BG_COLOR = '#000';

let snake, food, dx, dy, gameLoop, gameState = 'title';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawText(text, size, y) {
    ctx.fillStyle = '#fff';
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y);
}

function showTitleScreen() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawText('Snake Game', 36, canvas.height / 3);
    drawText('Press SPACE to Start', 24, canvas.height / 2);
}

function initGame() {
    snake = [{x: 10, y: 10}];
    food = getRandomPosition();
    dx = 1;
    dy = 0;
}

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
    };
}

function drawSnake() {
    ctx.fillStyle = SNAKE_COLOR;
    snake.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
}

function drawFood() {
    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        food = getRandomPosition();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    return (
        head.x < 0 || head.x >= canvas.width / GRID_SIZE ||
        head.y < 0 || head.y >= canvas.height / GRID_SIZE ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
}

function gameLoop() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    moveSnake();
    if (checkCollision()) {
        gameState = 'title';
        clearInterval(gameInterval);
        showTitleScreen();
        return;
    }

    drawSnake();
    drawFood();
}

document.addEventListener('keydown', (e) => {
    if (gameState === 'title' && e.code === 'Space') {
        gameState = 'playing';
        initGame();
        gameInterval = setInterval(gameLoop, 100);
    } else if (gameState === 'playing') {
        switch (e.code) {
            case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
        }
    }
});

showTitleScreen();
