import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppProps } from '../../../types';
import './Tetris.css';

const COLS = 10;
const ROWS = 20;
const CELL = 28;
const W = COLS * CELL;
const H = ROWS * CELL;

const PIECES = [
  { shape: [[1,1,1,1]], color: '#00d4ff' },
  { shape: [[1,1],[1,1]], color: '#ffd32a' },
  { shape: [[0,1,0],[1,1,1]], color: '#a29bfe' },
  { shape: [[1,0,0],[1,1,1]], color: '#fd9644' },
  { shape: [[0,0,1],[1,1,1]], color: '#0984e3' },
  { shape: [[0,1,1],[1,1,0]], color: '#2ed573' },
  { shape: [[1,1,0],[0,1,1]], color: '#ff4757' },
];

type Grid = (string | null)[][];

const emptyGrid = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const rotate = (shape: number[][]): number[][] => shape[0].map((_, i) => shape.map(r => r[i]).reverse());

interface Piece { shape: number[][]; color: string; x: number; y: number; }

const randomPiece = (): Piece => {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape, color: p.color, x: Math.floor((COLS - p.shape[0].length) / 2), y: 0 };
};

const fits = (grid: Grid, piece: Piece, ox = 0, oy = 0, shape?: number[][]): boolean => {
  const s = shape || piece.shape;
  for (let r = 0; r < s.length; r++) for (let c = 0; c < s[r].length; c++) {
    if (!s[r][c]) continue;
    const nx = piece.x + c + ox, ny = piece.y + r + oy;
    if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
    if (ny >= 0 && grid[ny][nx]) return false;
  }
  return true;
};

const Tetris: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    grid: emptyGrid(),
    current: randomPiece(),
    next: randomPiece(),
    score: 0, lines: 0, level: 1,
    running: false, gameOver: false, started: false,
    dropTimer: 0, dropInterval: 800,
    lockTimer: 0,
  });
  const [uiScore, setUiScore] = useState(0);
  const [uiLines, setUiLines] = useState(0);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiBest, setUiBest] = useState(0);
  const [uiOver, setUiOver] = useState(false);
  const [uiStarted, setUiStarted] = useState(false);
  const [uiPaused, setUiPaused] = useState(false);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);
  const keysRef = useRef(new Set<string>());
  const keyTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const drawCell = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, ghost = false) => {
    if (ghost) {
      ctx.fillStyle = color + '30';
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 1;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      ctx.strokeRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      return;
    }
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, 6);
    ctx.shadowBlur = 0;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if ((r + c) % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.015)'; ctx.fillRect(c * CELL, r * CELL, CELL, CELL); }
      if (s.grid[r][c]) drawCell(ctx, c, r, s.grid[r][c]!);
    }
    let ghostY = s.current.y;
    while (fits(s.grid, s.current, 0, ghostY - s.current.y + 1)) ghostY++;
    if (ghostY !== s.current.y) {
      for (let r = 0; r < s.current.shape.length; r++) for (let c = 0; c < s.current.shape[r].length; c++) {
        if (s.current.shape[r][c]) drawCell(ctx, s.current.x + c, ghostY + r, s.current.color, true);
      }
    }
    for (let r = 0; r < s.current.shape.length; r++) for (let c = 0; c < s.current.shape[r].length; c++) {
      if (s.current.shape[r][c]) drawCell(ctx, s.current.x + c, s.current.y + r, s.current.color);
    }
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke(); }
    for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke(); }
    const nc = nextRef.current;
    if (nc) {
      const nctx = nc.getContext('2d')!;
      nctx.fillStyle = '#0d1117'; nctx.fillRect(0, 0, 120, 80);
      const ns = s.next;
      const ox = Math.floor((4 - ns.shape[0].length) / 2);
      const oy = Math.floor((3 - ns.shape.length) / 2);
      for (let r = 0; r < ns.shape.length; r++) for (let c = 0; c < ns.shape[r].length; c++) {
        if (ns.shape[r][c]) {
          nctx.fillStyle = ns.color; nctx.shadowColor = ns.color; nctx.shadowBlur = 6;
          nctx.fillRect((ox + c) * 24 + 12, (oy + r) * 24 + 4, 22, 22);
          nctx.shadowBlur = 0;
        }
      }
    }
  }, []);

  const place = useCallback(() => {
    const s = stateRef.current;
    for (let r = 0; r < s.current.shape.length; r++) for (let c = 0; c < s.current.shape[r].length; c++) {
      if (s.current.shape[r][c]) {
        if (s.current.y + r < 0) { s.running = false; s.gameOver = true; setUiBest(p => Math.max(p, s.score)); setUiOver(true); return; }
        s.grid[s.current.y + r][s.current.x + c] = s.current.color;
      }
    }
    const full = s.grid.reduce((acc, row, i) => row.every(c => c) ? [...acc, i] : acc, [] as number[]);
    if (full.length) {
      full.forEach(i => s.grid.splice(i, 1));
      full.forEach(() => s.grid.unshift(Array(COLS).fill(null)));
      const pts = [0, 100, 300, 500, 800];
      s.score += (pts[full.length] || 800) * s.level;
      s.lines += full.length;
      s.level = Math.floor(s.lines / 10) + 1;
      s.dropInterval = Math.max(100, 800 - (s.level - 1) * 70);
      setUiScore(s.score); setUiLines(s.lines); setUiLevel(s.level);
    }
    s.current = s.next;
    s.next = randomPiece();
  }, []);

  const loop = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.running) return;
    if (!pausedRef.current) {
      const dt = now - lastRef.current;
      if (dt > s.dropInterval) {
        lastRef.current = now;
        if (fits(s.grid, s.current, 0, 1)) { s.current.y++; }
        else { place(); if (s.gameOver) { draw(); return; } }
      }
    }
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, place]);

  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    while (fits(s.grid, s.current, 0, 1)) { s.current.y++; s.score += 2; }
    place();
    setUiScore(s.score);
  }, [place]);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.grid = emptyGrid(); s.current = randomPiece(); s.next = randomPiece();
    s.score = 0; s.lines = 0; s.level = 1; s.dropInterval = 800;
    s.running = true; s.gameOver = false; s.started = true;
    pausedRef.current = false;
    setUiOver(false); setUiStarted(true); setUiPaused(false); setUiScore(0); setUiLines(0); setUiLevel(1);
    lastRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s.started || s.gameOver) return;
    pausedRef.current = !pausedRef.current;
    setUiPaused(pausedRef.current);
    if (!pausedRef.current) { lastRef.current = performance.now(); rafRef.current = requestAnimationFrame(loop); }
  }, [loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Space') { e.preventDefault(); if (!s.started || s.gameOver) start(); else hardDrop(); return; }
      if (e.code === 'Escape' || e.code === 'KeyP') { togglePause(); return; }
      if (!s.running || pausedRef.current) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { if (fits(s.grid, s.current, -1, 0)) s.current.x--; }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { if (fits(s.grid, s.current, 1, 0)) s.current.x++; }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { if (fits(s.grid, s.current, 0, 1)) { s.current.y++; s.score += 1; setUiScore(s.score); } else { place(); } }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        const r = rotate(s.current.shape);
        if (fits(s.grid, s.current, 0, 0, r)) s.current.shape = r;
      }
      draw();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(rafRef.current); };
  }, [draw, hardDrop, place, start, togglePause]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a29bfe'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
    ctx.fillText('🧱 ТЕТРИС', W / 2, H / 2 - 10);
    ctx.fillStyle = '#8b949e'; ctx.font = '13px monospace';
    ctx.fillText('Нажмите ПРОБЕЛ', W / 2, H / 2 + 20);
    ctx.textAlign = 'left';
  }, []);

  return (
    <div className="tetris-root">
      <canvas ref={canvasRef} width={W} height={H} className="tetris-canvas" tabIndex={0} />
      <div className="tetris-sidebar">
        <div className="tet-title">🧱 ТЕТРИС</div>
        <div className="tet-next-label">Следующий:</div>
        <canvas ref={nextRef} width={120} height={80} className="tet-next" />
        <div className="tet-stats">
          <div className="tet-stat"><span>Счёт</span><span className="tv purple">{uiScore}</span></div>
          <div className="tet-stat"><span>Линии</span><span className="tv cyan">{uiLines}</span></div>
          <div className="tet-stat"><span>Уровень</span><span className="tv yellow">{uiLevel}</span></div>
          <div className="tet-stat"><span>Рекорд</span><span className="tv">{uiBest}</span></div>
        </div>
        <div className="tet-hk">
          <div className="tet-hk-title">Управление</div>
          <div className="tet-row"><kbd>←→</kbd><span>Движение</span></div>
          <div className="tet-row"><kbd>↑ / W</kbd><span>Вращение</span></div>
          <div className="tet-row"><kbd>↓ / S</kbd><span>Вниз</span></div>
          <div className="tet-row"><kbd>Space</kbd><span>Сброс</span></div>
          <div className="tet-row"><kbd>P / Esc</kbd><span>Пауза</span></div>
        </div>
        <div className="tet-btns">
          {(!uiStarted || uiOver) && <button className="tet-btn start" onClick={start}>{uiOver ? '🔄 Заново' : '▶ Старт'}</button>}
          {uiStarted && !uiOver && <button className="tet-btn pause" onClick={togglePause}>{uiPaused ? '▶ Продолжить' : '⏸ Пауза'}</button>}
        </div>
        {uiOver && <div className="tet-over"><div className="to-t">💥 КОНЕЦ</div><div className="to-s">{uiScore}</div></div>}
        {uiPaused && !uiOver && <div className="tet-over"><div className="to-t">⏸ ПАУЗА</div></div>}
      </div>
    </div>
  );
};

export default Tetris;
