import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppProps } from '../../../types';
import './Snake.css';

const CELL = 20;
const COLS = 25;
const ROWS = 22;
const W = COLS * CELL;
const H = ROWS * CELL;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Pt { x: number; y: number; }

const rand = (max: number) => Math.floor(Math.random() * max);
const eq = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

const Snake: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 12, y: 11 }, { x: 11, y: 11 }, { x: 10, y: 11 }] as Pt[],
    dir: 'RIGHT' as Dir,
    nextDir: 'RIGHT' as Dir,
    food: { x: 18, y: 11 } as Pt,
    bonus: null as Pt | null,
    bonusTimer: 0,
    score: 0,
    running: false,
    gameOver: false,
    started: false,
    speed: 150,
    frame: 0,
  });
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(0);
  const [uiOver, setUiOver] = useState(false);
  const [uiStarted, setUiStarted] = useState(false);
  const [uiPaused, setUiPaused] = useState(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placeFood = (snake: Pt[]): Pt => {
    let p: Pt;
    do { p = { x: rand(COLS), y: rand(ROWS) }; }
    while (snake.some(s => eq(s, p)));
    return p;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2ed573';
    ctx.fillRect(s.food.x * CELL + CELL / 2 - 1, s.food.y * CELL + 2, 2, 5);

    if (s.bonus) {
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 150);
      ctx.fillStyle = `rgba(255,215,0,${pulse})`;
      ctx.beginPath();
      ctx.arc(s.bonus.x * CELL + CELL / 2, s.bonus.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', s.bonus.x * CELL + CELL / 2, s.bonus.y * CELL + CELL / 2 + 4);
      ctx.textAlign = 'left';
    }

    s.snake.forEach((seg, i) => {
      const t = i / s.snake.length;
      const g = Math.round(180 + (1 - t) * 75);
      ctx.fillStyle = i === 0 ? '#00ff88' : `rgb(0,${g},80)`;
      ctx.shadowColor = i === 0 ? '#00ff8888' : 'transparent';
      ctx.shadowBlur = i === 0 ? 10 : 0;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, i === 0 ? 6 : 4);
      ctx.fill();
      if (i === 0) {
        ctx.fillStyle = '#001a00';
        const ex = s.dir === 'LEFT' ? 3 : s.dir === 'RIGHT' ? CELL - 7 : 5;
        const ey = s.dir === 'UP' ? 3 : s.dir === 'DOWN' ? CELL - 7 : 5;
        ctx.fillRect(seg.x * CELL + ex, seg.y * CELL + ey, 3, 3);
        ctx.fillRect(seg.x * CELL + ex + (s.dir === 'UP' || s.dir === 'DOWN' ? 7 : 0), seg.y * CELL + ey + (s.dir === 'LEFT' || s.dir === 'RIGHT' ? 7 : 0), 3, 3);
      }
    });
    ctx.shadowBlur = 0;
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || pausedRef.current) return;
    s.dir = s.nextDir;
    const head = s.snake[0];
    const next: Pt = { x: head.x, y: head.y };
    if (s.dir === 'UP') next.y--;
    if (s.dir === 'DOWN') next.y++;
    if (s.dir === 'LEFT') next.x--;
    if (s.dir === 'RIGHT') next.x++;

    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS || s.snake.some(seg => eq(seg, next))) {
      s.running = false;
      s.gameOver = true;
      setUiBest(prev => Math.max(prev, s.score));
      setUiOver(true);
      draw();
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, H / 2 - 40, W, 80);
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 8);
        ctx.fillStyle = '#ffeaa7';
        ctx.font = '16px monospace';
        ctx.fillText(`Счёт: ${s.score}`, W / 2, H / 2 + 20);
        ctx.textAlign = 'left';
      }
      return;
    }

    const ateFood = eq(next, s.food);
    const ateBonus = s.bonus && eq(next, s.bonus);

    s.snake = [next, ...s.snake];
    if (!ateFood && !ateBonus) s.snake.pop();

    if (ateFood) {
      s.score += 10;
      s.food = placeFood(s.snake);
      s.speed = Math.max(70, s.speed - 2);
      s.bonusTimer++;
      if (s.bonusTimer % 5 === 0 && !s.bonus) s.bonus = placeFood(s.snake);
      setUiScore(s.score);
    }
    if (ateBonus) {
      s.score += 50;
      s.bonus = null;
      setUiScore(s.score);
    }

    draw();
    timerRef.current = setTimeout(tick, s.speed);
  }, [draw]);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 12, y: 11 }, { x: 11, y: 11 }, { x: 10, y: 11 }];
    s.dir = 'RIGHT'; s.nextDir = 'RIGHT';
    s.food = placeFood(s.snake);
    s.bonus = null; s.bonusTimer = 0;
    s.score = 0; s.speed = 150;
    s.running = true; s.gameOver = false; s.started = true;
    pausedRef.current = false;
    setUiOver(false); setUiStarted(true); setUiPaused(false); setUiScore(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(tick, s.speed);
  }, [tick]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s.started || s.gameOver) return;
    pausedRef.current = !pausedRef.current;
    setUiPaused(pausedRef.current);
    if (!pausedRef.current) timerRef.current = setTimeout(tick, s.speed);
  }, [tick]);

  useEffect(() => {
    const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    const map: Record<string, Dir> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', KeyW: 'UP', KeyS: 'DOWN', KeyA: 'LEFT', KeyD: 'RIGHT' };
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Space') { e.preventDefault(); if (!s.started || s.gameOver) start(); else togglePause(); return; }
      if (e.code === 'Escape') { togglePause(); return; }
      const d = map[e.code];
      if (d && d !== opp[s.dir]) stateRef.current.nextDir = d;
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [start, togglePause]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2ed573'; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center';
    ctx.fillText('🐍 ЗМЕЙКА', W / 2, H / 2 - 10);
    ctx.fillStyle = '#8b949e'; ctx.font = '14px monospace';
    ctx.fillText('Нажмите ПРОБЕЛ для старта', W / 2, H / 2 + 25);
    ctx.textAlign = 'left';
  }, []);

  return (
    <div className="snake-root">
      <canvas ref={canvasRef} width={W} height={H} className="snake-canvas" tabIndex={0} />
      <div className="snake-sidebar">
        <div className="snake-title">🐍 ЗМЕЙКА</div>
        <div className="sn-stats">
          <div className="sn-stat"><span>Счёт</span><span className="sv green">{uiScore}</span></div>
          <div className="sn-stat"><span>Рекорд</span><span className="sv yellow">{uiBest}</span></div>
        </div>
        <div className="sn-hk">
          <div className="sn-hk-title">Управление</div>
          <div className="sn-row"><kbd>↑↓←→</kbd><span>Движение</span></div>
          <div className="sn-row"><kbd>W A S D</kbd><span>Движение</span></div>
          <div className="sn-row"><kbd>Space</kbd><span>Старт/Пауза</span></div>
          <div className="sn-row"><kbd>Esc</kbd><span>Пауза</span></div>
        </div>
        <div className="sn-hk">
          <div className="sn-hk-title">Очки</div>
          <div className="sn-row"><span>🍎 Еда</span><span className="sv">+10</span></div>
          <div className="sn-row"><span>⭐ Бонус</span><span className="sv yellow">+50</span></div>
        </div>
        <div className="sn-btns">
          {(!uiStarted || uiOver) && <button className="sn-btn start" onClick={start}>{uiOver ? '🔄 Заново' : '▶ Старт'}</button>}
          {uiStarted && !uiOver && <button className="sn-btn pause" onClick={togglePause}>{uiPaused ? '▶ Продолжить' : '⏸ Пауза'}</button>}
        </div>
        {uiOver && <div className="sn-over"><div className="so-t">💀 КОНЕЦ</div><div className="so-s">Счёт: {uiScore}</div></div>}
        {uiPaused && !uiOver && <div className="sn-over"><div className="so-t">⏸ ПАУЗА</div></div>}
      </div>
    </div>
  );
};

export default Snake;
