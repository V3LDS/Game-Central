const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const playButton = document.getElementById('playButton');
const scoreList = document.getElementById('scoreList');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 200; // Start slower (lower number is faster)
const minGameSpeed = 50; // Maximum speed
const speedIncreaseRate = 2; // ms faster per fruit
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
let gameLoop;

playButton.addEventListener('click', startGame);

function startGame() {
    titleScreen.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameLoop = setInterval(updateGame, gameSpeed);
}

function updateGame() {
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }
    if (checkFoodCollision()) {
        score++;
        generateFood();
        increaseSpeed();
    }
    drawGame();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

function drawGame() {
    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawSnake();
    drawFood();
    drawScore();
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function checkFoodCollision() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

function increaseSpeed() {
    gameSpeed = Math.max(minGameSpeed, gameSpeed - speedIncreaseRate);
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, gameSpeed);
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 200; // Reset to initial speed
}

function endGame() {
    clearInterval(gameLoop);
    updateHighScores();
    canvas.style.display = 'none';
    titleScreen.style.display = 'block';
}

function updateHighScores() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
    displayHighScores();
}

function displayHighScores() {
    scoreList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        scoreList.appendChild(li);
    });
}

function drawScore() {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
    }
});

// Initialize high scores display
displayHighScores();
