const gameBoard = document.getElementById('game-board');
const newGameButton = document.getElementById('new-game');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
let board = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;

function initializeGame() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    updateScore();
    updateBestScore();
    addNewTile();
    addNewTile();
    renderBoard();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({row: i, col: j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {row, col} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = board[i][j] || '';
            if (board[i][j] > 0) {
                tile.style.backgroundColor = getTileColor(board[i][j]);
            }
            gameBoard.appendChild(tile);
        }
    }
}

function getTileColor(value) {
    const colors = {
        2: "#e0f7fa",
        4: "#b2ebf2",
        8: "#80deea",
        16: "#4dd0e1",
        32: "#26c6da",
        64: "#00bcd4",
        128: "#00acc1",
        256: "#0097a7",
        512: "#00838f",
        1024: "#006064",
        2048: "#004d40"
    };
    return colors[value] || "#b2dfdb";
}

function move(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function shiftTiles(arr) {
        const filtered = arr.filter(tile => tile !== 0);
        const missing = 4 - filtered.length;
        const zeros = Array(missing).fill(0);
        return direction === 'left' || direction === 'up' ? [...filtered, ...zeros] : [...zeros, ...filtered];
    }

    function mergeTiles(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
                moved = true;
                i++;
            }
        }
        return arr;
    }

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            let row = newBoard[i];
            row = shiftTiles(row);
            row = mergeTiles(row);
            row = shiftTiles(row);
            newBoard[i] = row;
            if (JSON.stringify(newBoard[i]) !== JSON.stringify(board[i])) {
                moved = true;
            }
        }
    } else {
        for (let j = 0; j < 4; j++) {
            let column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
            column = shiftTiles(column);
            column = mergeTiles(column);
            column = shiftTiles(column);
            for (let i = 0; i < 4; i++) {
                if (newBoard[i][j] !== column[i]) {
                    moved = true;
                }
                newBoard[i][j] = column[i];
            }
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        renderBoard();
        updateScore();
        updateBestScore();
    }

    if (isGameOver()) {
        showGameOverMessage();
    }
}

function updateScore() {
    scoreElement.textContent = `分数: ${score}`;
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
    bestScoreElement.textContent = `最高分: ${bestScore}`;
}

function handleKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
    }
}

// 鼠标拖拽相关变量和函数
let startX, startY, isDragging = false;

function handleMouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;
    
    if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            move(diffX > 0 ? 'right' : 'left');
        } else {
            move(diffY > 0 ? 'down' : 'up');
        }
        isDragging = false;
    }
}

function handleMouseUp() {
    isDragging = false;
}

function isGameOver() {
    // 检查是否还有空格
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }

    // 检查是否还有可以合并的相邻格子
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                (i < 3 && board[i][j] === board[i + 1][j]) ||
                (j < 3 && board[i][j] === board[i][j + 1])
            ) {
                return false;
            }
        }
    }

    return true;
}

function showGameOverMessage() {
    const modal = document.getElementById('gameOverModal');
    const finalScoreElement = document.getElementById('finalScore');
    finalScoreElement.textContent = `您的得分为：${score}`;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
}

// 将原有的 showGameOverMessage 函数替换为上面的新函数
// 其他代码保持不变
// ...

// 在文件末尾添加这行代码，以确保模态框可以被点击关闭
window.onclick = function(event) {
    const modal = document.getElementById('gameOverModal');
    if (event.target == modal) {
        closeModal();
    }
}

document.addEventListener('keydown', handleKeyDown);
gameBoard.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

newGameButton.addEventListener('click', initializeGame);

initializeGame();