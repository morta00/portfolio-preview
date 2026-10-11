(() => {
  // ---------- Connect Four: harder challenge ----------
  const ROWS = 6;
  const COLS = 7;
  const HUMAN = 1;
  const AI = 2;
  const EMPTY = 0;
  const SEARCH_DEPTH = 5;

  const boardEl = document.getElementById('connect-board');
  const statusEl = document.getElementById('game-status');
  const resultEl = document.getElementById('game-result');
  const restartBtn = document.getElementById('restart-game');
  const humanScoreEl = document.getElementById('human-score');
  const aiScoreEl = document.getElementById('ai-score');

  let pendingMove = null;
  let board = createBoard();
  let locked = false;
  let gameOver = false;
  let humanScore = 0;
  let aiScore = 0;

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  }

  function buildBoardUI() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'connect-cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Column ${c + 1}, row ${r + 1}`);
        cell.addEventListener('click', () => humanMove(c));
        boardEl.appendChild(cell);
      }
    }
    render();
  }

  function render(winningCells = []) {
    const winSet = new Set(winningCells.map(([r, c]) => `${r}-${c}`));
    boardEl.querySelectorAll('.connect-cell').forEach((cell) => {
      const r = Number(cell.dataset.row);
      const c = Number(cell.dataset.col);
      cell.className = 'connect-cell';
      if (board[r][c] === HUMAN) cell.classList.add('is-human');
      if (board[r][c] === AI) cell.classList.add('is-ai');
      if (winSet.has(`${r}-${c}`)) cell.classList.add('win');
      cell.disabled = locked || gameOver || !isValidColumn(c);
    });
    humanScoreEl.textContent = String(humanScore);
    aiScoreEl.textContent = String(aiScore);
  }

  function isValidColumn(col) {
    return board[0][col] === EMPTY;
  }

  function validColumns(state = board) {
    return [...Array(COLS).keys()].filter((c) => state[0][c] === EMPTY);
  }

  function dropPiece(state, col, piece) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (state[r][col] === EMPTY) {
        state[r][col] = piece;
        return r;
      }
    }
    return -1;
  }

  function humanMove(col) {
    if (locked || gameOver || !isValidColumn(col)) return;
    dropPiece(board, col, HUMAN);
    const humanWin = getWinningCells(board, HUMAN);
    if (humanWin.length) {
      gameOver = true;
      humanScore++;
      statusEl.textContent = 'You won.';
      resultEl.textContent = 'You’ve got the strategy. Let’s build intelligent systems together.';
      render(humanWin);
      return;
    }
    if (!validColumns().length) return endDraw();

    locked = true;
    statusEl.textContent = 'AI is thinking…';
    render();
    pendingMove = window.setTimeout(aiMove, 260);
  }

  function aiMove() {
    pendingMove = null;
    const choices = validColumns();
    if (!choices.length) return endDraw();
    const { column } = minimax(board, SEARCH_DEPTH, -Infinity, Infinity, true);
    const chosen = choices.includes(column) ? column : choices[Math.floor(choices.length / 2)];
    dropPiece(board, chosen, AI);
    const aiWin = getWinningCells(board, AI);
    locked = false;
    if (aiWin.length) {
      gameOver = true;
      aiScore++;
      statusEl.textContent = 'AI wins.';
      resultEl.textContent = 'One vote for hiring Mortadha? I’ll take it. Rematch, or let’s talk AI.';
      render(aiWin);
      return;
    }
    if (!validColumns().length) return endDraw();
    statusEl.textContent = 'Your move. Choose a column.';
    render();
  }

  function endDraw() {
    locked = false;
    gameOver = true;
    statusEl.textContent = 'Draw game.';
    resultEl.textContent = 'Well matched. Let’s put that strategy to work on something bigger.';
    render();
  }

  function minimax(state, depth, alpha, beta, maximizing) {
    const valid = validColumns(state);
    const terminal = winningMove(state, HUMAN) || winningMove(state, AI) || valid.length === 0;
    if (depth === 0 || terminal) {
      if (winningMove(state, AI)) return { column: null, score: 10000000 + depth };
      if (winningMove(state, HUMAN)) return { column: null, score: -10000000 - depth };
      if (!valid.length) return { column: null, score: 0 };
      return { column: null, score: scorePosition(state, AI) };
    }

    const ordered = orderColumns(valid);
    if (maximizing) {
      let bestScore = -Infinity;
      let bestCol = ordered[0];
      for (const col of ordered) {
        const next = state.map((row) => row.slice());
        dropPiece(next, col, AI);
        const score = minimax(next, depth - 1, alpha, beta, false).score;
        if (score > bestScore) {
          bestScore = score;
          bestCol = col;
        }
        alpha = Math.max(alpha, bestScore);
        if (alpha >= beta) break;
      }
      return { column: bestCol, score: bestScore };
    }

    let bestScore = Infinity;
    let bestCol = ordered[0];
    for (const col of ordered) {
      const next = state.map((row) => row.slice());
      dropPiece(next, col, HUMAN);
      const score = minimax(next, depth - 1, alpha, beta, true).score;
      if (score < bestScore) {
        bestScore = score;
        bestCol = col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return { column: bestCol, score: bestScore };
  }

  function orderColumns(cols) {
    return cols.slice().sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));
  }

  function scorePosition(state, piece) {
    const opponent = piece === AI ? HUMAN : AI;
    let score = 0;
    for (let r = 0; r < ROWS; r++) if (state[r][3] === piece) score += 6;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) score += scoreWindow([state[r][c], state[r][c+1], state[r][c+2], state[r][c+3]], piece, opponent);
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) score += scoreWindow([state[r][c], state[r+1][c], state[r+2][c], state[r+3][c]], piece, opponent);
    }
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) score += scoreWindow([state[r][c], state[r+1][c+1], state[r+2][c+2], state[r+3][c+3]], piece, opponent);
    }
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) score += scoreWindow([state[r][c], state[r-1][c+1], state[r-2][c+2], state[r-3][c+3]], piece, opponent);
    }
    return score;
  }

  function scoreWindow(window, piece, opponent) {
    const own = window.filter((v) => v === piece).length;
    const opp = window.filter((v) => v === opponent).length;
    const empty = window.filter((v) => v === EMPTY).length;
    let score = 0;
    if (own === 4) score += 100000;
    else if (own === 3 && empty === 1) score += 120;
    else if (own === 2 && empty === 2) score += 12;
    if (opp === 3 && empty === 1) score -= 150;
    else if (opp === 2 && empty === 2) score -= 8;
    return score;
  }

  function winningMove(state, piece) {
    return getWinningCells(state, piece).length > 0;
  }

  function getWinningCells(state, piece) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const cells = [[r,c],[r,c+1],[r,c+2],[r,c+3]];
        if (cells.every(([rr,cc]) => state[rr][cc] === piece)) return cells;
      }
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        const cells = [[r,c],[r+1,c],[r+2,c],[r+3,c]];
        if (cells.every(([rr,cc]) => state[rr][cc] === piece)) return cells;
      }
    }
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const cells = [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
        if (cells.every(([rr,cc]) => state[rr][cc] === piece)) return cells;
      }
    }
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const cells = [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
        if (cells.every(([rr,cc]) => state[rr][cc] === piece)) return cells;
      }
    }
    return [];
  }

  function resetGame() {
    window.clearTimeout(pendingMove);
    pendingMove = null;
    board = createBoard();
    locked = false;
    gameOver = false;
    statusEl.textContent = 'Your move. Choose a column.';
    resultEl.textContent = '';
    buildBoardUI();
  }

  restartBtn.addEventListener('click', resetGame);
  buildBoardUI();
})();