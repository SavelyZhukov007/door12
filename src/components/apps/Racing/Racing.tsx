import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppProps } from '../../../types';
import './Racing.css';

interface Car {
  x: number;
  y: number;
  speed: number;
  lane: number;
  color: string;
  name: string;
  isPlayer: boolean;
  score: number;
  alive: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

const ROAD_WIDTH = 400;
const ROAD_LEFT = 100;
const LANES = 3;
const LANE_WIDTH = ROAD_WIDTH / LANES;
const CAR_WIDTH = 36;
const CAR_HEIGHT = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 520;

const laneCenter = (lane: number) => ROAD_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;

const Racing: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    player: Car;
    ai: Car[];
    obstacles: Obstacle[];
    particles: Particle[];
    roadOffset: number;
    frame: number;
    running: boolean;
    gameOver: boolean;
    started: boolean;
    score: number;
    speed: number;
    keys: Set<string>;
    spawnTimer: number;
    aiSpawnTimer: number;
  }>({
    player: { x: laneCenter(1), y: CANVAS_HEIGHT - 100, speed: 0, lane: 1, color: '#00d4ff', name: 'Игрок', isPlayer: true, score: 0, alive: true },
    ai: [],
    obstacles: [],
    particles: [],
    roadOffset: 0,
    frame: 0,
    running: false,
    gameOver: false,
    started: false,
    score: 0,
    speed: 3,
    keys: new Set(),
    spawnTimer: 0,
    aiSpawnTimer: 0,
  });

  const [uiScore, setUiScore] = useState(0);
  const [uiSpeed, setUiSpeed] = useState(0);
  const [uiGameOver, setUiGameOver] = useState(false);
  const [uiStarted, setUiStarted] = useState(false);
  const [uiPaused, setUiPaused] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const spawnAI = useCallback(() => {
    const s = stateRef.current;
    const aiColors = ['#ff4757', '#ffa502', '#2ed573', '#ff6b81', '#eccc68'];
    const usedLanes = s.ai.filter(a => a.y < 120).map(a => a.lane);
    const available = [0, 1, 2].filter(l => !usedLanes.includes(l));
    if (available.length === 0) return;
    const lane = available[Math.floor(Math.random() * available.length)];
    s.ai.push({
      x: laneCenter(lane),
      y: -80,
      speed: s.speed * 0.65 + Math.random() * 0.8,
      lane,
      color: aiColors[s.ai.length % aiColors.length],
      name: `AI-${s.ai.length + 1}`,
      isPlayer: false,
      score: 0,
      alive: true,
    });
  }, []);

  const spawnObstacle = useCallback(() => {
    const s = stateRef.current;
    const lane = Math.floor(Math.random() * LANES);
    s.obstacles.push({
      x: laneCenter(lane) - 18,
      y: -50,
      width: 36,
      height: 24,
      color: '#636e72',
      speed: s.speed * 0.45,
    });
  }, []);

  const addParticles = useCallback((x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 18; i++) {
      s.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        alpha: 1,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }, []);

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) => {
    const cx = x - CAR_WIDTH / 2;
    const cy = y - CAR_HEIGHT / 2;

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(cx + 6, cy, CAR_WIDTH - 12, CAR_HEIGHT, 6);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(cx, cy + 14, CAR_WIDTH, CAR_HEIGHT - 28, 4);
    ctx.fill();

    ctx.fillStyle = isPlayer ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(cx + 7, cy + 8, CAR_WIDTH - 14, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.fillRect(cx + 2, cy + 12, 8, 10);
    ctx.fillRect(cx + CAR_WIDTH - 10, cy + 12, 8, 10);
    ctx.fillRect(cx + 2, cy + CAR_HEIGHT - 22, 8, 10);
    ctx.fillRect(cx + CAR_WIDTH - 10, cy + CAR_HEIGHT - 22, 8, 10);

    if (isPlayer) {
      ctx.fillStyle = '#ffdd59';
      ctx.fillRect(cx + 6, cy, CAR_WIDTH - 12, 6);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(cx + 6, cy + CAR_HEIGHT - 6, CAR_WIDTH - 12, 6);
    }

    ctx.shadowBlur = 0;
  };

  const drawRoad = (ctx: CanvasRenderingContext2D, offset: number) => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#2d3436';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#636e72';
    ctx.lineWidth = 3;
    ctx.strokeRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([40, 30]);
    for (let lane = 1; lane < LANES; lane++) {
      const lx = ROAD_LEFT + lane * LANE_WIDTH;
      ctx.beginPath();
      ctx.lineDashOffset = -offset % 70;
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (let i = -1; i <= 2; i++) {
      const baseY = (offset % 80) + i * 80;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(ROAD_LEFT, baseY, ROAD_WIDTH, 40);
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    ctx.shadowColor = '#e17055';
    ctx.shadowBlur = 8;
    ctx.fillStyle = obs.color;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
    ctx.fill();
    ctx.fillStyle = '#e17055';
    ctx.fillRect(obs.x + 4, obs.y + obs.height / 2 - 2, obs.width - 8, 4);
    ctx.shadowBlur = 0;
  };

  const checkCollision = (ax: number, ay: number, bx: number, by: number, bw: number, bh: number) => {
    return (
      ax - CAR_WIDTH / 2 < bx + bw &&
      ax + CAR_WIDTH / 2 > bx &&
      ay - CAR_HEIGHT / 2 < by + bh &&
      ay + CAR_HEIGHT / 2 > by
    );
  };

  const checkCarCollision = (ax: number, ay: number, bx: number, by: number) => {
    const pad = 6;
    return (
      Math.abs(ax - bx) < CAR_WIDTH - pad &&
      Math.abs(ay - by) < CAR_HEIGHT - pad
    );
  };

  const updateAI = useCallback((ai: Car, obstacles: Obstacle[], playerY: number, allAI: Car[]) => {
    const s = stateRef.current;
    ai.y += s.speed - ai.speed * 0.35;

    const lookahead = 120;
    const dangerObs = obstacles.filter(o =>
      Math.abs(o.x + o.width / 2 - laneCenter(ai.lane)) < LANE_WIDTH * 0.7 &&
      o.y > ai.y - 10 && o.y < ai.y + lookahead
    );
    const dangerCars = allAI.filter(other =>
      other !== ai && other.alive &&
      Math.abs(other.x - ai.x) < CAR_WIDTH + 4 &&
      other.y > ai.y - 10 && other.y < ai.y + lookahead
    );

    if (dangerObs.length > 0 || dangerCars.length > 0) {
      const safeLanes = [0, 1, 2].filter(l => {
        const lx = laneCenter(l);
        const obsBlock = obstacles.some(o =>
          Math.abs(o.x + o.width / 2 - lx) < LANE_WIDTH * 0.6 &&
          o.y > ai.y - 10 && o.y < ai.y + lookahead + 40
        );
        const carBlock = allAI.some(other =>
          other !== ai && other.alive &&
          Math.abs(other.x - lx) < CAR_WIDTH + 8 &&
          other.y > ai.y - 10 && other.y < ai.y + lookahead + 40
        );
        return !obsBlock && !carBlock;
      });
      if (safeLanes.length > 0) {
        const best = safeLanes.reduce((a, b) => Math.abs(a - ai.lane) < Math.abs(b - ai.lane) ? a : b);
        ai.lane = best;
      }
    }

    const targetX = laneCenter(ai.lane);
    ai.x += (targetX - ai.x) * 0.1;
    ai.x = Math.max(ROAD_LEFT + CAR_WIDTH / 2, Math.min(ROAD_LEFT + ROAD_WIDTH - CAR_WIDTH / 2, ai.x));
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (pausedRef.current) {
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    s.frame++;
    s.score += 1;
    s.speed = 3 + s.score / 800;

    s.roadOffset += s.speed * 2;

    const { keys, player } = s;

    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      player.x -= 3.5;
      player.x = Math.max(ROAD_LEFT + CAR_WIDTH / 2, player.x);
    }
    if (keys.has('ArrowRight') || keys.has('KeyD')) {
      player.x += 3.5;
      player.x = Math.max(ROAD_LEFT + CAR_WIDTH / 2, Math.min(ROAD_LEFT + ROAD_WIDTH - CAR_WIDTH / 2, player.x));
    }
    if (keys.has('ArrowUp') || keys.has('KeyW')) {
      player.y = Math.max(80, player.y - 2.5);
    }
    if (keys.has('ArrowDown') || keys.has('KeyS')) {
      player.y = Math.min(CANVAS_HEIGHT - 80, player.y + 2.5);
    }

    s.spawnTimer++;
    const spawnRate = Math.max(40, 90 - s.score / 200);
    if (s.spawnTimer >= spawnRate) {
      spawnObstacle();
      s.spawnTimer = 0;
    }

    s.aiSpawnTimer++;
    if (s.aiSpawnTimer >= 180 && s.ai.length < 3) {
      spawnAI();
      s.aiSpawnTimer = 0;
    }

    s.obstacles.forEach(o => { o.y += s.speed * 1.2; });
    s.obstacles = s.obstacles.filter(o => o.y < CANVAS_HEIGHT + 60);

    s.ai.forEach(ai => updateAI(ai, s.obstacles, player.y, s.ai));
    s.ai = s.ai.filter(ai => ai.y < CANVAS_HEIGHT + 100);

    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      p.vx *= 0.96;
      p.vy *= 0.96;
    });
    s.particles = s.particles.filter(p => p.alpha > 0);

    let crashed = false;
    for (const obs of s.obstacles) {
      if (checkCollision(player.x, player.y, obs.x, obs.y, obs.width, obs.height)) {
        crashed = true;
        addParticles(player.x, player.y, '#00d4ff');
        break;
      }
    }
    for (const ai of s.ai) {
      if (ai.alive && checkCarCollision(player.x, player.y, ai.x, ai.y)) {
        crashed = true;
        addParticles(player.x, player.y, '#00d4ff');
        addParticles(ai.x, ai.y, ai.color);
        break;
      }
    }

    drawRoad(ctx, s.roadOffset);

    s.obstacles.forEach(o => drawObstacle(ctx, o));
    s.ai.forEach(ai => {
      if (ai.alive) drawCar(ctx, ai.x, ai.y, ai.color, false);
    });

    if (!crashed) {
      drawCar(ctx, player.x, player.y, '#00d4ff', true);
    }

    s.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, ROAD_LEFT - 2, CANVAS_HEIGHT);
    ctx.fillRect(ROAD_LEFT + ROAD_WIDTH + 2, 0, CANVAS_WIDTH - ROAD_LEFT - ROAD_WIDTH - 2, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(CANVAS_WIDTH - 140, 8, 132, 62);
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`Счёт: ${s.score}`, CANVAS_WIDTH - 130, 28);
    ctx.fillStyle = '#ffeaa7';
    ctx.fillText(`Скорость: ${(s.speed * 40).toFixed(0)} км/ч`, CANVAS_WIDTH - 130, 50);
    ctx.fillStyle = '#a29bfe';
    ctx.fillText(`Лучший: ${Math.max(bestScore, s.score)}`, CANVAS_WIDTH - 130, 65);

    if (s.frame % 6 === 0) {
      setUiScore(s.score);
      setUiSpeed(Math.round(s.speed * 40));
    }

    if (crashed) {
      s.running = false;
      s.gameOver = true;
      setBestScore(prev => Math.max(prev, s.score));
      setUiGameOver(true);
      setUiScore(s.score);
      return;
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [addParticles, bestScore, spawnAI, spawnObstacle, updateAI]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.player = { x: laneCenter(1), y: CANVAS_HEIGHT - 100, speed: 0, lane: 1, color: '#00d4ff', name: 'Игрок', isPlayer: true, score: 0, alive: true };
    s.ai = [];
    s.obstacles = [];
    s.particles = [];
    s.roadOffset = 0;
    s.frame = 0;
    s.running = true;
    s.gameOver = false;
    s.started = true;
    s.score = 0;
    s.speed = 3;
    s.spawnTimer = 0;
    s.aiSpawnTimer = 0;
    pausedRef.current = false;
    setUiGameOver(false);
    setUiStarted(true);
    setUiPaused(false);
    spawnAI();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, spawnAI]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setUiPaused(pausedRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      stateRef.current.keys.add(e.code);
      if (e.code === 'Space') {
        e.preventDefault();
        if (!stateRef.current.started || stateRef.current.gameOver) {
          startGame();
        } else {
          togglePause();
        }
      }
      if (e.code === 'Escape') {
        if (stateRef.current.running) togglePause();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.code);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startGame, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawRoad(ctx, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏎 ГОНКИ', CANVAS_WIDTH / 2, 200);
    ctx.fillStyle = '#dfe6e9';
    ctx.font = '15px monospace';
    ctx.fillText('Нажмите ПРОБЕЛ для старта', CANVAS_WIDTH / 2, 250);
    ctx.textAlign = 'left';
  }, []);

  return (
    <div className="racing-root">
      <div className="racing-layout">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="racing-canvas"
          tabIndex={0}
        />
        <div className="racing-sidebar">
          <div className="racing-title">🏎 ГОНКИ</div>

          <div className="racing-stats">
            <div className="stat-row"><span>Счёт</span><span className="stat-val blue">{uiScore}</span></div>
            <div className="stat-row"><span>Скорость</span><span className="stat-val yellow">{uiSpeed} км/ч</span></div>
            <div className="stat-row"><span>Рекорд</span><span className="stat-val purple">{bestScore}</span></div>
          </div>

          <div className="racing-hotkeys">
            <div className="hk-title">Управление</div>
            <div className="hk-row"><kbd>←→</kbd><span>Поворот</span></div>
            <div className="hk-row"><kbd>↑↓</kbd><span>Газ / тормоз</span></div>
            <div className="hk-row"><kbd>A D</kbd><span>Поворот</span></div>
            <div className="hk-row"><kbd>W S</kbd><span>Газ / тормоз</span></div>
            <div className="hk-row"><kbd>Space</kbd><span>Старт / Пауза</span></div>
            <div className="hk-row"><kbd>Esc</kbd><span>Пауза</span></div>
          </div>

          <div className="racing-legend">
            <div className="hk-title">Легенда</div>
            <div className="legend-row"><span className="legend-dot" style={{background:'#00d4ff'}}/>Твоя машина</div>
            <div className="legend-row"><span className="legend-dot" style={{background:'#ff4757'}}/>ИИ противник</div>
            <div className="legend-row"><span className="legend-dot" style={{background:'#636e72'}}/>Препятствие</div>
          </div>

          <div className="racing-btns">
            {(!uiStarted || uiGameOver) && (
              <button className="race-btn start" onClick={startGame}>
                {uiGameOver ? '🔄 Заново' : '▶ Старт'}
              </button>
            )}
            {uiStarted && !uiGameOver && (
              <button className="race-btn pause" onClick={togglePause}>
                {uiPaused ? '▶ Продолжить' : '⏸ Пауза'}
              </button>
            )}
          </div>

          {uiGameOver && (
            <div className="racing-gameover">
              <div className="go-title">💥 АВАРИЯ!</div>
              <div className="go-score">Счёт: {uiScore}</div>
            </div>
          )}
          {uiPaused && !uiGameOver && (
            <div className="racing-gameover">
              <div className="go-title">⏸ ПАУЗА</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Racing;
