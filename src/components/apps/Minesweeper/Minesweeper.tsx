import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppProps } from '../../../types';
import './Minesweeper.css';

type CellState = { mine: boolean; revealed: boolean; flagged: boolean; count: number; };
type Difficulty = 'easy' | 'medium' | 'hard';

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 16, cols: 30, mines: 99 },
};

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const NUM_COLORS = ['','#0984e3','#2ed573','#ff4757','#6c5ce7','#d63031','#00cec9','#000','#636e72'];

const buildGrid = (rows: number, cols: number, mines: number, safeR: number, safeC: number): CellState[][] => {
  const grid: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (grid[r][c].mine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    grid[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c].mine) continue;
    grid[r][c].count = DIRS.reduce((acc, [dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      return acc + (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine ? 1 : 0);
    }, 0);
  }
  return grid;
};

const Minesweeper: React.FC<AppProps> = () => {
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });
  const [firstClick, setFirstClick] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const { rows, cols, mines } = CONFIGS[diff];
  const flagCount = grid.flat().filter(c => c.flagged).length;

  const initGrid = useCallback((d: Difficulty) => {
    const cfg = CONFIGS[d];
    setGrid(Array.from({ length: cfg.rows }, () =>
      Array.from({ length: cfg.cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))));
    setStarted(true); setGameOver(false); setWon(false); setTime(0); setFirstClick(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => { initGrid(diff); }, []);

  const reveal = useCallback((grid: CellState[][], r: number, c: number): CellState[][] => {
    const g = grid.map(row => row.map(cell => ({ ...cell })));
    const flood = (r: number, c: number) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (g[r][c].revealed || g[r][c].flagged) return;
      g[r][c].revealed = true;
      if (g[r][c].count === 0 && !g[r][c].mine) DIRS.forEach(([dr, dc]) => flood(r + dr, c + dc));
    };
    flood(r, c);
    return g;
  }, [rows, cols]);

  const click = useCallback((r: number, c: number) => {
    if (gameOver || won) return;
    let g = grid.map(row => row.map(cell => ({ ...cell })));
    if (g[r][c].flagged || g[r][c].revealed) return;

    if (firstClick) {
      const cfg = CONFIGS[diff];
      g = buildGrid(cfg.rows, cfg.cols, cfg.mines, r, c);
      setFirstClick(false);
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }

    if (g[r][c].mine) {
      g.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      g[r][c].revealed = true;
      setGrid(g); setGameOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const ng = reveal(g, r, c);
    const safe = ng.flat().filter(c => !c.mine);
    if (safe.every(c => c.revealed)) {
      setBest(prev => ({ ...prev, [diff]: prev[diff] > 0 ? Math.min(prev[diff], time) : time }));
      setWon(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setGrid(ng);
  }, [diff, firstClick, gameOver, grid, reveal, time, won]);

  const flag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || grid[r]?.[c]?.revealed) return;
    setGrid(g => g.map((row, ri) => row.map((cell, ci) =>
      ri === r && ci === c ? { ...cell, flagged: !cell.flagged } : cell
    )));
  }, [gameOver, grid, won]);

  const reset = () => initGrid(diff);
  const changeDiff = (d: Difficulty) => { setDiff(d); initGrid(d); };

  const cellClass = (cell: CellState, r: number, c: number) => {
    if (!cell.revealed) return cell.flagged ? 'ms-cell flagged' : 'ms-cell hidden';
    if (cell.mine) return 'ms-cell mine';
    return 'ms-cell revealed';
  };

  const cellContent = (cell: CellState) => {
    if (!cell.revealed) return cell.flagged ? '🚩' : '';
    if (cell.mine) return '💣';
    return cell.count > 0 ? <span style={{ color: NUM_COLORS[cell.count], fontWeight: 'bold' }}>{cell.count}</span> : '';
  };

  return (
    <div className="ms-root">
      <div className="ms-header">
        <div className="ms-diff-btns">
          {(['easy','medium','hard'] as Difficulty[]).map(d => (
            <button key={d} className={`ms-diff ${diff === d ? 'active' : ''}`} onClick={() => changeDiff(d)}>
              {d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'}
            </button>
          ))}
        </div>
        <div className="ms-info">
          <span className="ms-counter">💣 {mines - flagCount}</span>
          <button className="ms-reset" onClick={reset}>{gameOver ? '😵' : won ? '😎' : '🙂'}</button>
          <span className="ms-counter">⏱ {time}с</span>
        </div>
      </div>
      {(won || gameOver) && (
        <div className={`ms-banner ${won ? 'win' : 'lose'}`}>
          {won ? `🎉 ПОБЕДА! ${best[diff] > 0 ? `Рекорд: ${best[diff]}с` : ''}` : '💥 ВЗРЫВ! Попробуй снова'}
        </div>
      )}
      <div className="ms-scroll">
        <div className="ms-grid" style={{ gridTemplateColumns: `repeat(${cols}, 26px)` }}>
          {grid.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} className={cellClass(cell, r, c)}
              onClick={() => click(r, c)}
              onContextMenu={e => flag(e, r, c)}>
              {cellContent(cell)}
            </div>
          )))}
        </div>
      </div>
      <div className="ms-footer">
        <span>ЛКМ — открыть • ПКМ — флаг</span>
        {best[diff] > 0 && <span>Рекорд: {best[diff]}с</span>}
      </div>
    </div>
  );
};

export default Minesweeper;
