let rows, cols, mines;
let board, minePositions;
let gameOver = false;
let firstClick = true;
const modes = {
    easy: { rows: 5, cols: 5, mines: 9 },
    medium: { rows: 8, cols: 8, mines: 20 },
    hard: { rows: 10, cols: 12, mines: 45 },
    hardcore: { rows: 12, cols: 15, mines: 65 },
    legend: { rows: 14, cols: 17, mines: 150 }
};
function resetGame() {
    document.getElementById('game').innerHTML = '';
    document.getElementById('message').textContent = '';
    document.getElementById('settings').style.display = 'block';
    gameOver = false;
    firstClick = true;
    minePositions = [];
    board = [];
}
function updateSettings(mode) {
    const customSettings = document.getElementById('custom-settings');
    if (mode === 'custom') {
        customSettings.style.display = 'flex';
    } else {
        customSettings.style.display = 'none';
        const settings = modes[mode];
        document.getElementById('rows').value = settings.rows;
        document.getElementById('cols').value = settings.cols;
        document.getElementById('mines').value = settings.mines;
        startGame();
    }
}
function startGame() {
    rows = parseInt(document.getElementById('rows').value);
    cols = parseInt(document.getElementById('cols').value);
    mines = parseInt(document.getElementById('mines').value);
    gameOver = false;
    firstClick = true;
    document.getElementById('message').textContent = '';
    document.getElementById('settings').style.display = 'none';
    if (rows < 5 || cols < 5) {
        alert('El tamaño mínimo del tablero es 5x5');
        return;
    }
    initializeBoard();
    placeMines();
    calculateAdjacentMines();
    renderBoard();
}
function initializeBoard() {
    board = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
            mine: false,
            open: false,
            flagged: false,
            adjacentMines: 0,
        }))
    );
    minePositions = [];
}
function placeMines(excludeRow = -1, excludeCol = -1) {
    minePositions = [];
    while (minePositions.length < mines) {
        const position = {
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols)
        };
        if (!minePositions.some(p => p.row === position.row && p.col === position.col) &&
            (position.row !== excludeRow || position.col !== excludeCol)) {
            minePositions.push(position);
            board[position.row][position.col].mine = true;
        }
    }
}
function calculateAdjacentMines() {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) continue;
            let adjacentMines = 0;
            directions.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
                    adjacentMines++;
                }
            });
            board[r][c].adjacentMines = adjacentMines;
        }
    }
}
function renderBoard() {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';
    gameElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    gameElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell.open) {
                cellElement.classList.add(cell.mine ? 'mine' : 'open');
                cellElement.textContent = cell.mine ? '💣' : cell.adjacentMines || '';
            } else if (cell.flagged) {
                cellElement.textContent = '🚩';
                cellElement.classList.add('flagged');
            }
            cellElement.addEventListener('click', () => cellClicked(r, c));
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(r, c);
            });
            gameElement.appendChild(cellElement);
        });
    });
}
function cellClicked(row, col) {
    if (gameOver || board[row][col].open || board[row][col].flagged) return;
    if (firstClick && board[row][col].mine) {
        board[row][col].mine = false;
        firstClick = false;
        placeMines(row, col);
        calculateAdjacentMines();
    }
    firstClick = false;
    board[row][col].open = true;
    if (board[row][col].mine) {
        endGame(false);
        return;
    }
    if (board[row][col].adjacentMines === 0) {
        revealEmptyCells(row, col);
    }
    renderBoard();
    if (checkWin()) endGame(true);
}
function revealEmptyCells(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    directions.forEach(([dr, dc]) => {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc].open && !board[nr][nc].mine) {
            board[nr][nc].open = true;
            if (board[nr][nc].adjacentMines === 0) {
                revealEmptyCells(nr, nc);
            }
        }
    });
}
function flagCell(row, col) {
    if (gameOver || board[row][col].open) return;
    board[row][col].flagged = !board[row][col].flagged;
    renderBoard();
}
function checkWin() {
    return board.flat().every(cell => cell.mine || cell.open);
}
function endGame(won) {
    gameOver = true;
    document.getElementById('message').textContent = won ? '¡Ganaste!' : '¡Perdiste! Has pisado una mina.';
    alert(won ? '¡Ganaste!' : '¡Perdiste! Has pisado una mina.');
    if (!won) {
        board.forEach(row => row.forEach(cell => {
            if (cell.mine) cell.open = true;
        }));
    }
    renderBoard();
}
