(() => {
  // ---------- Tic-Tac-Toe: quick warm-up ----------
  const TTT_HUMAN = 'X';
  const TTT_AI = 'O';
  const tttBoardEl = document.getElementById('ttt-board');
  const tttStatusEl = document.getElementById('ttt-status');
  const tttResultEl = document.getElementById('ttt-result');
  const tttRestart = document.getElementById('ttt-restart');
  const tttHumanScoreEl = document.getElementById('ttt-human-score');
  const tttAiScoreEl = document.getElementById('ttt-ai-score');
  const tttDrawScoreEl = document.getElementById('ttt-draw-score');
  const hardModeLink = document.getElementById('hard-mode-link');

  let ttt = Array(9).fill('');
  let tttLocked = false;
  let tttOver = false;
  let tttHumanScore = 0;
  let tttAiScore = 0;
  let tttDrawScore = 0;

  const TTT_WINS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function tttWinner(state) {
    for (const line of TTT_WINS) {
      const [a,b,c] = line;
      if (state[a] && state[a] === state[b] && state[a] === state[c]) return { piece: state[a], line };
    }
    return null;
  }

  function tttAvailable(state) {
    return state.map((v,i) => v ? -1 : i).filter(i => i !== -1);
  }

  function tttMinimax(state, isMax) {
    const win = tttWinner(state);
    if (win?.piece === TTT_AI) return { score: 10 };
    if (win?.piece === TTT_HUMAN) return { score: -10 };
    const moves = tttAvailable(state);
    if (!moves.length) return { score: 0 };

    let best = { score: isMax ? -Infinity : Infinity, index: moves[0] };
    for (const index of moves) {
      const next = state.slice();
      next[index] = isMax ? TTT_AI : TTT_HUMAN;
      const result = tttMinimax(next, !isMax);
      const score = result.score + (isMax ? -0.05 : 0.05);
      if ((isMax && score > best.score) || (!isMax && score < best.score)) best = { score, index };
    }
    return best;
  }

  function renderTtt(winLine = []) {
    tttBoardEl.innerHTML = '';
    ttt.forEach((value, index) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ttt-cell' + (value === TTT_AI ? ' is-ai' : '');
      if (winLine.includes(index)) cell.classList.add('win');
      cell.textContent = value;
      cell.disabled = tttLocked || tttOver || Boolean(value);
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', value ? `Square ${index + 1}: ${value}` : `Square ${index + 1}: empty`);
      cell.addEventListener('click', () => tttHumanMove(index));
      tttBoardEl.appendChild(cell);
    });
    tttHumanScoreEl.textContent = String(tttHumanScore);
    tttAiScoreEl.textContent = String(tttAiScore);
    tttDrawScoreEl.textContent = String(tttDrawScore);
  }

  function finishTtt(result) {
    tttOver = true;
    const win = tttWinner(ttt);
    if (result === 'human') {
      tttHumanScore++;
      tttStatusEl.textContent = 'You won.';
      tttResultEl.textContent = 'You beat the quick agent. Nice. Now try hard mode.';
    } else if (result === 'ai') {
      tttAiScore++;
      tttStatusEl.textContent = 'AI wins.';
      tttResultEl.textContent = 'The AI got three in a row. Want the harder challenge?';
    } else {
      tttDrawScore++;
      tttStatusEl.textContent = 'Draw.';
      tttResultEl.textContent = 'A draw is the expected result against perfect play. Try hard mode.';
    }
    hardModeLink.classList.add('is-visible');
    renderTtt(win?.line || []);
  }

  function tttHumanMove(index) {
    if (tttLocked || tttOver || ttt[index]) return;
    ttt[index] = TTT_HUMAN;
    const win = tttWinner(ttt);
    if (win) return finishTtt('human');
    if (!tttAvailable(ttt).length) return finishTtt('draw');

    tttLocked = true;
    tttStatusEl.textContent = 'AI thinking…';
    renderTtt();
    window.setTimeout(() => {
      const move = tttMinimax(ttt, true).index;
      if (Number.isInteger(move)) ttt[move] = TTT_AI;
      tttLocked = false;
      const aiWin = tttWinner(ttt);
      if (aiWin) return finishTtt('ai');
      if (!tttAvailable(ttt).length) return finishTtt('draw');
      tttStatusEl.textContent = 'Your move.';
      tttResultEl.textContent = 'You are X.';
      renderTtt();
    }, 180);
  }

  function resetTtt() {
    ttt = Array(9).fill('');
    tttLocked = false;
    tttOver = false;
    tttStatusEl.textContent = 'Your move.';
    tttResultEl.textContent = 'You play first.';
    hardModeLink.classList.remove('is-visible');
    renderTtt();
  }

  tttRestart.addEventListener('click', resetTtt);
  resetTtt();

  // ---------- Compact game tabs ----------
  const gameTabs = [...document.querySelectorAll('[data-game-tab]')];
  const gamePanels = [...document.querySelectorAll('[data-game-panel]')];
  const embeddedGames = Boolean(document.querySelector('[data-embedded-games]'));

  function showGame(name, updateHash = true) {
    gameTabs.forEach((tab) => {
      const active = tab.dataset.gameTab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    gamePanels.forEach((panel) => {
      const active = panel.dataset.gamePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (updateHash && !embeddedGames) history.replaceState(null, '', '#' + name);
  }

  gameTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showGame(tab.dataset.gameTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % gameTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + gameTabs.length) % gameTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = gameTabs.length - 1;
      showGame(gameTabs[next].dataset.gameTab, false);
      gameTabs[next].focus();
    });
  });
  hardModeLink.addEventListener('click', () => showGame('hard'));

  const initialGame = location.hash === '#hard' ? 'hard' : 'quick';
  showGame(initialGame, false);

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
      resultEl.textContent = 'You beat hard mode. Mortadha owes you a coffee.';
      render(humanWin);
      return;
    }
    if (!validColumns().length) return endDraw();

    locked = true;
    statusEl.textContent = 'AI is thinking…';
    render();
    window.setTimeout(aiMove, 260);
  }

  function aiMove() {
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
      resultEl.textContent = 'AI wins. I’ll count that as one vote for hiring Mortadha.';
      render(aiWin);
      return;
    }
    if (!validColumns().length) return endDraw();
    statusEl.textContent = 'Your move — choose a column.';
    render();
  }

  function endDraw() {
    locked = false;
    gameOver = true;
    statusEl.textContent = 'Draw game.';
    resultEl.textContent = 'A draw. I’ll call that a successful technical interview.';
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
    board = createBoard();
    locked = false;
    gameOver = false;
    statusEl.textContent = 'Your move — choose a column.';
    resultEl.textContent = '';
    buildBoardUI();
  }

  restartBtn.addEventListener('click', resetGame);
  buildBoardUI();
})();