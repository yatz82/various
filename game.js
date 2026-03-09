const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');

const tileSize = 20;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let score = 0;
let gameRunning = true;

// 1: Wall, 0: Pellet, 2: Empty, 3: Pac-Man (Initial), 4: Ghost (Initial)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,1,1,2,2,1,1,2,1,0,1,1,1,1],
    [1,2,2,2,0,2,2,1,2,2,2,2,1,2,2,0,2,2,2,1],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,2,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let pacman = {
    x: 9,
    y: 16,
    dir: 'right',
    nextDir: 'right'
};

let ghosts = [
    { x: 9, y: 8, color: 'red', dir: 'up' },
    { x: 10, y: 8, color: 'pink', dir: 'up' },
    { x: 9, y: 9, color: 'cyan', dir: 'down' },
    { x: 10, y: 9, color: 'orange', dir: 'down' }
];

function drawMaze() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = maze[r][c];
            if (tile === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            } else if (tile === 0) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    let centerX = pacman.x * tileSize + tileSize / 2;
    let centerY = pacman.y * tileSize + tileSize / 2;
    ctx.arc(centerX, centerY, tileSize / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x * tileSize + 2, ghost.y * tileSize + 2, tileSize - 4, tileSize - 4);
    });
}

function movePacman() {
    let nextX = pacman.x;
    let nextY = pacman.y;

    if (pacman.nextDir === 'up') nextY--;
    else if (pacman.nextDir === 'down') nextY++;
    else if (pacman.nextDir === 'left') nextX--;
    else if (pacman.nextDir === 'right') nextX++;

    if (maze[nextY] && maze[nextY][nextX] !== 1) {
        pacman.dir = pacman.nextDir;
        pacman.x = nextX;
        pacman.y = nextY;
    } else {
        nextX = pacman.x;
        nextY = pacman.y;
        if (pacman.dir === 'up') nextY--;
        else if (pacman.dir === 'down') nextY++;
        else if (pacman.dir === 'left') nextX--;
        else if (pacman.dir === 'right') nextX++;

        if (maze[nextY] && maze[nextY][nextX] !== 1) {
            pacman.x = nextX;
            pacman.y = nextY;
        }
    }

    if (maze[pacman.y][pacman.x] === 0) {
        maze[pacman.y][pacman.x] = 2;
        score += 10;
        scoreElement.innerText = `Score: ${score}`;
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        let directions = ['up', 'down', 'left', 'right'];
        let possibleDirs = directions.filter(dir => {
            let nx = ghost.x;
            let ny = ghost.y;
            if (dir === 'up') ny--;
            else if (dir === 'down') ny++;
            else if (dir === 'left') nx--;
            else if (dir === 'right') nx++;
            return maze[ny] && maze[ny][nx] !== 1;
        });

        if (possibleDirs.length > 0) {
            if (!possibleDirs.includes(ghost.dir) || Math.random() < 0.3) {
                ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            }
            if (ghost.dir === 'up') ghost.y--;
            else if (ghost.dir === 'down') ghost.y++;
            else if (ghost.dir === 'left') ghost.x--;
            else if (ghost.dir === 'right') ghost.x++;
        }
    });
}

function checkCollisions() {
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            gameRunning = false;
            messageElement.innerText = 'GAME OVER';
            messageElement.style.color = 'red';
        }
    });

    let pelletsRemaining = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (maze[r][c] === 0) {
                pelletsRemaining = true;
                break;
            }
        }
        if (pelletsRemaining) break;
    }

    if (!pelletsRemaining) {
        gameRunning = false;
        messageElement.innerText = 'YOU WIN!';
        messageElement.style.color = 'yellow';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') pacman.nextDir = 'up';
    else if (e.key === 'ArrowDown') pacman.nextDir = 'down';
    else if (e.key === 'ArrowLeft') pacman.nextDir = 'left';
    else if (e.key === 'ArrowRight') pacman.nextDir = 'right';
});

function update() {
    if (!gameRunning) return;
    movePacman();
    moveGhosts();
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPacman();
    drawGhosts();
}

function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        setTimeout(gameLoop, 200);
    }
}

gameLoop();
