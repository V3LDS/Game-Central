const titleScreen = document.getElementById('titleScreen');
const highScoreScreen = document.getElementById('highScoreScreen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreList = document.getElementById('scoreList');

const snakeButton = document.getElementById('snakeButton');
const crossyRoadButton = document.getElementById('crossyRoadButton');
const highScoresButton = document.getElementById('highScoresButton');
const snakeScoresButton = document.getElementById('snakeScoresButton');
const crossyScoresButton = document.getElementById('crossyScoresButton');
const backButton = document.getElementById('backButton');

let snakeHighScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
let crossyHighScores = JSON.parse(localStorage.getItem('crossyHighScores')) || [];

snakeButton.addEventListener('click', startSnakeGame);
crossyRoadButton.addEventListener('click', startCrossyRoadGame);
highScoresButton.addEventListener('click', showHighScoreScreen);
snakeScoresButton.addEventListener('click', showSnakeScores);
crossyScoresButton.addEventListener('click', showCrossyScores);
backButton.addEventListener('click', showTitleScreen);

// Snake Game Variables
let snake, food, dx, dy, score, snakeGameActive, snakeGameLoop;
let snakeSpeed = 200; // Start slower (higher number is slower)
const minSnakeSpeed = 50; // Maximum speed
const snakeSpeedIncrease = 5; // ms faster per fruit

function startSnakeGame() {
    titleScreen.style.display = 'none';
    canvas.style.display = 'block';
    initSnakeGame();
}

function initSnakeGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    dx = 1;
    dy = 0;
    score = 0;
    snakeSpeed = 200; // Reset speed at the start of each game
    snakeGameActive = true;
    document.removeEventListener('keydown', moveCrossyPlayer);
    document.addEventListener('keydown', changeSnakeDirection);
    runSnakeGame();
}

function runSnakeGame() {
    if (snakeGameActive) {
        updateSnakeGame();
        snakeGameLoop = setTimeout(runSnakeGame, snakeSpeed);
    }
}

function updateSnakeGame() {
    moveSnake();
    if (checkSnakeCollision()) {
        endSnakeGame();
        return;
    }
    if (checkSnakeFoodCollision()) {
        score++;
        generateSnakeFood();
        increaseSnakeSpeed();
    } else {
        snake.pop();
    }
    drawSnakeGame();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
}

function drawSnakeGame() {
    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });
    
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function generateSnakeFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / 20)),
        y: Math.floor(Math.random() * (canvas.height / 20))
    };
}

function checkSnakeCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function checkSnakeFoodCollision() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

function changeSnakeDirection(e) {
    if (!snakeGameActive) return;
    switch (e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
    }
}

function increaseSnakeSpeed() {
    snakeSpeed = Math.max(minSnakeSpeed, snakeSpeed - snakeSpeedIncrease);
}

function endSnakeGame() {
    snakeGameActive = false;
    clearTimeout(snakeGameLoop);
    document.removeEventListener('keydown', changeSnakeDirection);
    updateHighScores('snake', score);
    setTimeout(() => {
        alert(`Game Over! Your score: ${score}`);
        showTitleScreen();
    }, 50);
}

// Crossy Road Game Variables
let player, lanes, crossyGameActive, crossyScore, crossyAnimationFrame;
const laneHeight = 40;
const carWidth = 40;
const playerSize = 20;
const totalLanes = 10;
const safeLanes = [9, 4]; // Bottom lane (9) is always safe, second safe lane is 4
let playerTargetY;
let lastUpdateTime = 0;
const moveDuration = 100; // milliseconds for smooth movement

function startCrossyRoadGame() {
    titleScreen.style.display = 'none';
    canvas.style.display = 'block';
    initCrossyRoad();
}

function initCrossyRoad() {
    player = { x: canvas.width / 2, y: canvas.height - playerSize };
    playerTargetY = player.y;
    lanes = [];
    crossyGameActive = true;
    crossyScore = 0;
    for (let i = 0; i < totalLanes; i++) {
        createLane(i);
    }
    // Ensure the bottom lane (where the player starts) is always safe
    lanes[totalLanes - 1] = { type: 'safe' };
    document.addEventListener('keydown', moveCrossyPlayer);
    lastUpdateTime = performance.now();
    crossyAnimationFrame = requestAnimationFrame(updateCrossyRoad);
}

function createLane(laneIndex) {
    if (safeLanes.includes(laneIndex)) {
        lanes[laneIndex] = { type: 'safe' };
    } else {
        const cars = [];
        const numCars = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numCars; i++) {
            cars.push({
                x: Math.random() * canvas.width,
                speed: (Math.random() * 100 + 50) * (Math.random() < 0.5 ? 1 : -1)
            });
        }
        lanes[laneIndex] = { type: 'road', cars: cars };
    }
}

function moveCrossyPlayer(e) {
    if (!crossyGameActive) return;
    let oldLane = Math.floor(player.y / laneHeight);
    let newLane;

    switch (e.key) {
        case 'ArrowUp':
            playerTargetY = Math.max(0, player.y - laneHeight);
            newLane = Math.floor(playerTargetY / laneHeight);
            if (playerTargetY === 0) {
                crossyScore++; // Increase score for reaching the top
                player.y = canvas.height - playerSize; // Teleport to bottom
                playerTargetY = player.y; // Update target to match new position
                resetLanes();
            } else if (safeLanes.includes(newLane) && newLane !== oldLane) {
                crossyScore++; // Increase score for reaching a new safe lane
            }
            break;
        case 'ArrowDown':
            playerTargetY = Math.min(canvas.height - playerSize, player.y + laneHeight);
            newLane = Math.floor(playerTargetY / laneHeight);
            if (safeLanes.includes(newLane) && newLane !== oldLane) {
                crossyScore++; // Increase score for reaching a safe lane when moving down
            }
            break;
        case 'ArrowLeft':
            player.x = Math.max(0, player.x - 20);
            break;
        case 'ArrowRight':
            player.x = Math.min(canvas.width - playerSize, player.x + 20);
            break;
    }
}

function resetLanes() {
    lanes = [];
    for (let i = 0; i < totalLanes; i++) {
        createLane(i);
    }
    // Ensure the bottom lane (where the player starts) is always safe
    lanes[totalLanes - 1] = { type: 'safe' };
}

function updateCrossyRoad(currentTime) {
    if (!crossyGameActive) return;

    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = currentTime;

    // Smooth player movement
    const moveProgress = Math.min(deltaTime / (moveDuration / 1000), 1);
    player.y += (playerTargetY - player.y) * moveProgress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lanes and cars
    lanes.forEach((lane, index) => {
        if (lane.type === 'safe') {
            ctx.fillStyle = '#90EE90'; // Light green for safe lanes
        } else {
            ctx.fillStyle = index % 2 === 0 ? '#ccc' : '#999';
        }
        ctx.fillRect(0, index * laneHeight, canvas.width, laneHeight);

        if (lane.type === 'road') {
            ctx.fillStyle = 'red';
            lane.cars.forEach(car => {
                ctx.fillRect(car.x, index * laneHeight + 10, carWidth, 20);
                car.x += car.speed * deltaTime;
                if (car.speed > 0 && car.x > canvas.width) {
                    car.x = -carWidth;
                } else if (car.speed < 0 && car.x < -carWidth) {
                    car.x = canvas.width;
                }
            });
        }
    });

    // Draw player
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, playerSize, playerSize);

    // Check collisions
    const playerLane = Math.floor(player.y / laneHeight);
    if (lanes[playerLane] && lanes[playerLane].type === 'road') {
        lanes[playerLane].cars.forEach(car => {
            if (
                player.x < car.x + carWidth &&
                player.x + playerSize > car.x &&
                player.y < (playerLane + 1) * laneHeight &&
                player.y + playerSize > playerLane * laneHeight
            ) {
                endCrossyRoad();
                return;
            }
        });
    }

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${crossyScore}`, 10, 30);

    crossyAnimationFrame = requestAnimationFrame(updateCrossyRoad);
}

function endCrossyRoad() {
    crossyGameActive = false;
    cancelAnimationFrame(crossyAnimationFrame);
    document.removeEventListener('keydown', moveCrossyPlayer);
    updateHighScores('crossy', crossyScore);
    setTimeout(() => {
        alert(`Game Over! Your score: ${crossyScore}`);
        showTitleScreen();
    }, 50);
}

const snakeScoreScreen = document.getElementById('snakeScoreScreen');
const crossyScoreScreen = document.getElementById('crossyScoreScreen');
const snakeScoreList = document.getElementById('snakeScoreList');
const crossyScoreList = document.getElementById('crossyScoreList');
const snakeScoreBackButton = document.getElementById('snakeScoreBackButton');
const crossyScoreBackButton = document.getElementById('crossyScoreBackButton');

snakeScoresButton.addEventListener('click', showSnakeScores);
crossyScoresButton.addEventListener('click', showCrossyScores);
snakeScoreBackButton.addEventListener('click', showHighScoreScreen);
crossyScoreBackButton.addEventListener('click', showHighScoreScreen);

function showHighScoreScreen() {
    titleScreen.style.display = 'none';
    highScoreScreen.style.display = 'block';
    snakeScoreScreen.style.display = 'none';
    crossyScoreScreen.style.display = 'none';
    canvas.style.display = 'none';
}

function showSnakeScores() {
    highScoreScreen.style.display = 'none';
    snakeScoreScreen.style.display = 'block';
    displayHighScores('snake');
}

function showCrossyScores() {
    highScoreScreen.style.display = 'none';
    crossyScoreScreen.style.display = 'block';
    displayHighScores('crossy');
}

function showTitleScreen() {
    highScoreScreen.style.display = 'none';
    snakeScoreScreen.style.display = 'none';
    crossyScoreScreen.style.display = 'none';
    canvas.style.display = 'none';
    titleScreen.style.display = 'block';
    
    // Stop any ongoing games
    crossyGameActive = false;
    cancelAnimationFrame(crossyAnimationFrame);
    document.removeEventListener('keydown', moveCrossyPlayer);
    // Also stop the Snake game if it's running
    // (Add code to stop Snake game here)
}

function displayHighScores(game) {
    const scores = game === 'snake' ? snakeHighScores : crossyHighScores;
    const scoreList = game === 'snake' ? snakeScoreList : crossyScoreList;
    
    scoreList.innerHTML = '';
    if (scores.length === 0) {
        scoreList.innerHTML = '<p>NO HIGHSCORES</p>';
    } else {
        const ol = document.createElement('ol');
        scores.forEach((score) => {
            const li = document.createElement('li');
            li.textContent = score;
            ol.appendChild(li);
        });
        scoreList.appendChild(ol);
    }
}

function updateHighScores(game, score) {
    const scores = game === 'snake' ? snakeHighScores : crossyHighScores;
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores.splice(5); // Keep only top 5 scores
    localStorage.setItem(game === 'snake' ? 'snakeHighScores' : 'crossyHighScores', JSON.stringify(scores));
}

// Initialize high scores display
displayHighScores('snake');
