import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppProps } from '../../../types';
import './Pong.css';

const W = 600, H = 400;
const PAD_W = 10, PAD_H = 70, PAD_SPEED = 4;
const BALL_SIZE = 10;

const Pong: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    ball: { x: W / 2, y: H / 2, vx: 4, vy: 3 },
    p1: { y: H / 2 - PAD_H / 2, score: 0 },
    p2: { y: H / 2 - PAD_H / 2, score: 0 },
    running: false, started: false, gameOver: false,
    mode: 'ai' as 'ai' | '2p',
    aiLevel: 1,
    keys: new Set<string>(),
    winner: '',
    maxScore: 7,
    particles: [] as { x: number; y: number; vx: number; vy: number; alpha: number; color: string }[],
  });
  const [uiP1, setUiP1] = useState(0);
  const [uiP2, setUiP2] = useState(0);
  const [uiOver, setUiOver] = useState(false);
  const [uiWinner, setUiWinner] = useState('');
  const [uiStarted, setUiStarted] = useState(false);
  const [uiPaused, setUiPaused] = useState(false);
  const [mode, setMode] = useState<'ai' | '2p'>('ai');
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const burst = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 12; i++) s.particles.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, alpha: 1, color });
  };

  const resetBall = (dir: 1 | -1) => {
    const s = stateRef.current;
    s.ball = { x: W / 2, y: H / 2, vx: (4 + Math.random()) * dir, vy: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random()) };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    s.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 12;
    ctx.fillRect(10, s.p1.y, PAD_W, PAD_H);
    ctx.fillStyle = '#ff4757';
    ctx.shadowColor = '#ff4757';
    ctx.fillRect(W - 10 - PAD_W, s.p2.y, PAD_W, PAD_H);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_SIZE / 2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(s.p1.score), W / 2 - 60, 50);
    ctx.fillText(String(s.p2.score), W / 2 + 60, 50);
    ctx.textAlign = 'left';
  }, []);

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || pausedRef.current) { draw(); rafRef.current = requestAnimationFrame(loop); return; }
    if (s.gameOver) return;

    // Управление левой платформой (Игрок 1): только W/S
    if (s.keys.has('KeyW')) s.p1.y = Math.max(0, s.p1.y - PAD_SPEED);
    if (s.keys.has('KeyS')) s.p1.y = Math.min(H - PAD_H, s.p1.y + PAD_SPEED);

    // Управление правой платформой
    if (s.mode === '2p') {
      // Режим 2 игрока: стрелки управляют правой платформой
      if (s.keys.has('ArrowUp')) s.p2.y = Math.max(0, s.p2.y - PAD_SPEED);
      if (s.keys.has('ArrowDown')) s.p2.y = Math.min(H - PAD_H, s.p2.y + PAD_SPEED);
    } else {
      // Режим AI
      const aiSpeed = 2 + s.aiLevel * 0.7;
      const target = s.ball.y - PAD_H / 2 + (Math.random() - 0.5) * 20 * (3 - s.aiLevel);
      if (s.p2.y + PAD_H / 2 < target) s.p2.y = Math.min(H - PAD_H, s.p2.y + aiSpeed);
      else s.p2.y = Math.max(0, s.p2.y - aiSpeed);
    }

    // Логика движения мяча, отскоки, подсчёт очков — без изменений
    s.ball.x += s.ball.vx;
    s.ball.y += s.ball.vy;

    if (s.ball.y - BALL_SIZE / 2 <= 0) { s.ball.vy = Math.abs(s.ball.vy); s.ball.y = BALL_SIZE / 2; }
    if (s.ball.y + BALL_SIZE / 2 >= H) { s.ball.vy = -Math.abs(s.ball.vy); s.ball.y = H - BALL_SIZE / 2; }

    if (s.ball.x - BALL_SIZE / 2 <= 10 + PAD_W &&
      s.ball.x - BALL_SIZE / 2 >= 10 &&
      s.ball.y >= s.p1.y - BALL_SIZE / 2 &&
      s.ball.y <= s.p1.y + PAD_H + BALL_SIZE / 2) {
      const hit = (s.ball.y - (s.p1.y + PAD_H / 2)) / (PAD_H / 2);
      s.ball.vx = Math.abs(s.ball.vx) * 1.05;
      s.ball.vy = hit * 6;
      s.ball.x = 10 + PAD_W + BALL_SIZE / 2;
      burst(s.ball.x, s.ball.y, '#00d4ff');
    }

    if (s.ball.x + BALL_SIZE / 2 >= W - 10 - PAD_W &&
      s.ball.x + BALL_SIZE / 2 <= W - 10 &&
      s.ball.y >= s.p2.y - BALL_SIZE / 2 &&
      s.ball.y <= s.p2.y + PAD_H + BALL_SIZE / 2) {
      const hit = (s.ball.y - (s.p2.y + PAD_H / 2)) / (PAD_H / 2);
      s.ball.vx = -Math.abs(s.ball.vx) * 1.05;
      s.ball.vy = hit * 6;
      s.ball.x = W - 10 - PAD_W - BALL_SIZE / 2;
      burst(s.ball.x, s.ball.y, '#ff4757');
    }

    s.ball.vx = Math.max(-12, Math.min(12, s.ball.vx));
    s.ball.vy = Math.max(-10, Math.min(10, s.ball.vy));

    if (s.ball.x < 0) {
      s.p2.score++;
      burst(W / 2, H / 2, '#ff4757');
      setUiP2(s.p2.score);
      if (s.p2.score >= s.maxScore) {
        s.gameOver = true;
        s.winner = s.mode === 'ai' ? 'ИИ победил!' : 'Игрок 2 победил!';
        setUiOver(true);
        setUiWinner(s.winner);
      } else resetBall(1);
    }
    if (s.ball.x > W) {
      s.p1.score++;
      burst(W / 2, H / 2, '#00d4ff');
      setUiP1(s.p1.score);
      if (s.p1.score >= s.maxScore) {
        s.gameOver = true;
        s.winner = 'Игрок 1 победил!';
        setUiOver(true);
        setUiWinner(s.winner);
      } else resetBall(-1);
    }

    s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.alpha -= 0.05; p.vx *= 0.95; p.vy *= 0.95; });
    s.particles = s.particles.filter(p => p.alpha > 0);

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  const start = useCallback((m?: 'ai' | '2p') => {
    const s = stateRef.current;
    const md = m || s.mode;
    s.mode = md;
    s.ball = { x: W / 2, y: H / 2, vx: 4, vy: 3 };
    s.p1 = { y: H / 2 - PAD_H / 2, score: 0 };
    s.p2 = { y: H / 2 - PAD_H / 2, score: 0 };
    s.running = true;
    s.started = true;
    s.gameOver = false;
    s.winner = '';
    s.particles = [];
    pausedRef.current = false;
    setUiP1(0); setUiP2(0); setUiOver(false); setUiWinner(''); setUiStarted(true); setUiPaused(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const togglePause = useCallback(() => {
    if (!stateRef.current.started || stateRef.current.gameOver) return;
    pausedRef.current = !pausedRef.current;
    setUiPaused(pausedRef.current);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      // Разрешаем клавиши управления только соответствующим игрокам
      const allowedKeysForP1 = ['KeyW', 'KeyS'];
      const allowedKeysForP2 = ['ArrowUp', 'ArrowDown'];
      if (allowedKeysForP1.includes(e.code) || allowedKeysForP2.includes(e.code)) {
        e.preventDefault();
        s.keys.add(e.code);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!s.started || s.gameOver) start();
        else togglePause();
      }
      if (e.code === 'Escape') togglePause();
    };
    const onUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.code);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fdcb6e'; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center';
      ctx.fillText('🏓 ПИНГ-ПОНГ', W / 2, H / 2 - 10);
      ctx.fillStyle = '#8b949e'; ctx.font = '13px monospace';
      ctx.fillText('Нажмите ПРОБЕЛ для старта', W / 2, H / 2 + 25);
      ctx.textAlign = 'left';
    }
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [start, togglePause]);

  return (
    <div className="pong-root">
      <div className="pong-layout">
        <div className="pong-left">
          <div className="pong-player-label" style={{ color: '#00d4ff' }}>👤 Игрок 1</div>
          <div className="pong-hk">
            <div className="pk-title">П1 Управление</div>
            <div className="pk-row"><kbd>W</kbd><span>Вверх</span></div>
            <div className="pk-row"><kbd>S</kbd><span>Вниз</span></div>
          </div>
          {mode === '2p' && (
            <div className="pong-hk">
              <div className="pk-title">П2 Управление</div>
              <div className="pk-row"><kbd>↑</kbd><span>Вверх</span></div>
              <div className="pk-row"><kbd>↓</kbd><span>Вниз</span></div>
            </div>
          )}
          <div className="pong-hk">
            <div className="pk-title">Система</div>
            <div className="pk-row"><kbd>Space</kbd><span>Старт/Пауза</span></div>
            <div className="pk-row"><kbd>Esc</kbd><span>Пауза</span></div>
          </div>
          <div className="pong-mode-btns">
            <button className={`pk-mode-btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => { setMode('ai'); stateRef.current.mode = 'ai'; }}>vs ИИ</button>
            <button className={`pk-mode-btn ${mode === '2p' ? 'active' : ''}`} onClick={() => { setMode('2p'); stateRef.current.mode = '2p'; }}>2 игрока</button>
          </div>
        </div>

        <div className="pong-center">
          <canvas ref={canvasRef} width={W} height={H} className="pong-canvas" tabIndex={0} />
          {uiOver && (
            <div className="pong-over">
              <div className="po-title">{uiWinner}</div>
              <button className="pong-btn" onClick={() => start()}>🔄 Заново</button>
            </div>
          )}
          {uiPaused && !uiOver && <div className="pong-pause">⏸ ПАУЗА</div>}
        </div>

        <div className="pong-right">
          <div className="pong-player-label" style={{ color: '#ff4757' }}>{mode === 'ai' ? '🤖 ИИ' : '👤 Игрок 2'}</div>
          <div className="pong-score-big">
            <span style={{ color: '#00d4ff' }}>{uiP1}</span>
            <span style={{ color: '#636e72' }}>:</span>
            <span style={{ color: '#ff4757' }}>{uiP2}</span>
          </div>
          <div className="pong-hk">
            <div className="pk-title">До победы</div>
            <div className="pk-row"><span>🏆</span><span>{stateRef.current.maxScore} очков</span></div>
          </div>
          {!uiStarted || uiOver ? (
            <button className="pong-btn" onClick={() => start(mode)}>▶ Старт</button>
          ) : (
            <button className="pong-btn pause" onClick={togglePause}>{uiPaused ? '▶ Продолжить' : '⏸ Пауза'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pong;