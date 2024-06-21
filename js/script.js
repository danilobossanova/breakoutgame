// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações da bola
const ballRadius = 5;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let ballSpeed = Math.sqrt(dx * dx + dy * dy).toFixed(2); // Velocidade inicial da bola
const speedIncrement = 0.1;

// Configurações da raquete
let paddleHeight = 5;
let paddleWidth = 180;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controle de teclas
let rightPressed = false;
let leftPressed = false;
let isPaused = false;

// Elementos HTML para mostrar informações
const speedDisplay = document.getElementById('ballSpeed');
const sizeDisplay = document.getElementById('paddleSize');

// Configurações dos tijolos
const brickRowCount = 7;
const brickColumnCount = 15;
const brickWidth = 65;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

let bricks = [];
for(let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for(let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: Math.random() < 0.2 ? 3 : 1 }; // 20% dos tijolos são duros com 3 toques
    }
}

// Contadores
let score = 0;
let lives = 50;

// Adiciona event listeners para os controles da raquete
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.getElementById("pauseButton").addEventListener("click", togglePause);

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        gameLoop();
    }
}

function playBreakSound() {
    document.getElementById('breakSound').play();
}

// Detecta colisões com os tijolos
function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status > 0) {
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    if(b.status > 1) {
                        b.status--;
                    } else {
                        if (b.status === 1) { // O tijolo estava no status 1 e agora será destruído
                            if (b.initialStatus === 3) {
                                playBreakSound(); // Tocar som apenas quando tijolos duros são destruídos
                            }
                            b.status = 0;
                            score++;
                            if(score % brickColumnCount == 0) {
                                paddleWidth += 15;
                                sizeDisplay.textContent = `Tamanho da Raquete: ${paddleWidth}`;
                            }
                            increaseBallSpeed();
                        }
                    }
                    if(score == brickRowCount * brickColumnCount) {
                        alert("VOCÊ VENCEU, PARABÉNS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// Aumenta a velocidade da bola
function increaseBallSpeed() {
    if(dx > 0) {
        dx += speedIncrement;
    } else {
        dx -= speedIncrement;
    }
    if(dy > 0) {
        dy += speedIncrement;
    } else {
        dy -= speedIncrement;
    }
    ballSpeed = Math.sqrt(dx * dx + dy * dy).toFixed(2); // Atualiza a velocidade da bola
    speedDisplay.textContent = `Velocidade da Bola: ${ballSpeed}`;
}

// Desenha a bola
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Desenha a raquete
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Desenha os tijolos
function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status > 0) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                if(bricks[c][r].status == 3) {
                    ctx.fillStyle = "#FFD700"; // Tijolos duros são dourados
                } else if(bricks[c][r].status == 2) {
                    ctx.fillStyle = "#FFA500"; // Tijolos duros rachados são laranja
                } else if(bricks[c][r].status == 1) {
                    ctx.fillStyle = getBrickColor(r);
                }
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Define a cor dos tijolos com base na linha
function getBrickColor(row) {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FF8C33", "#57FF33", "#33FFF6"];
    return colors[row % colors.length];
}

// Desenha o placar
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Pontuação: " + score, 8, 20);
}

// Desenha o contador de vidas
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Vidas: " + lives, canvas.width - 65, 20);
}

// Desenha todo o conteúdo do jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // Detecta colisões com as bordas do canvas
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if(!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    x += dx;
    y += dy;

    // Movimento da raquete
    if(rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

function gameLoop() {
    if (!isPaused) {
        draw();
        setTimeout(gameLoop, 10); // Atualiza o jogo manualmente a cada 10ms
    }
}

// Inicia o jogo
gameLoop();
