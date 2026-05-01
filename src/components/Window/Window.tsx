import React, { useRef, useState, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { AppWindow } from '../../types';
import { AppIcon } from '../Icons';
import './Window.css';

interface WindowProps {
  window: AppWindow;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AppWindow>) => void;
  children: React.ReactNode;
}

// Minimal inline SVG buttons — not reusing Icons.tsx to keep them sharp at 10px
const BtnMinimize = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="1" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);
const BtnMaximize = ({ isMax }: { isMax: boolean }) => isMax ? (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <rect x="3" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
    <rect x="1" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="#0e0e0e" />
  </svg>
) : (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
const BtnClose = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const Window: React.FC<WindowProps> = ({ window: win, onFocus, onClose, onMinimize, onMaximize: _onMaximize, onUpdate, children }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ isResizing: false, direction: '', startX: 0, startY: 0, origW: 0, origH: 0, origX: 0, origY: 0 });
  const [prevState, setPrevState] = useState({ x: win.x, y: win.y, width: win.width, height: win.height });

  useEffect(() => {
    if (windowRef.current) {
      animate(windowRef.current, { opacity: [0, 1], scale: [0.96, 1], duration: 160, ease: 'outCubic' });
    }
  }, []);

  const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    onFocus(win.id);
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      onUpdate(win.id, {
        x: dragRef.current.origX + ev.clientX - dragRef.current.startX,
        y: Math.max(0, dragRef.current.origY + ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current.isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, win.x, win.y, win.isMaximized, onFocus, onUpdate]);

  const handleMouseDownResize = useCallback((e: React.MouseEvent, direction: string) => {
    if (win.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { isResizing: true, direction, startX: e.clientX, startY: e.clientY, origW: win.width, origH: win.height, origX: win.x, origY: win.y };
    const minW = 300, minH = 200;
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current.isResizing) return;
      const { direction: dir, startX, startY, origW, origH, origX, origY } = resizeRef.current;
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      let newW = origW, newH = origH, newX = origX, newY = origY;
      if (dir.includes('e')) newW = Math.max(minW, origW + dx);
      if (dir.includes('s')) newH = Math.max(minH, origH + dy);
      if (dir.includes('w')) { newW = Math.max(minW, origW - dx); newX = origX + origW - newW; }
      if (dir.includes('n')) { newH = Math.max(minH, origH - dy); newY = origY + origH - newH; }
      onUpdate(win.id, { width: newW, height: newH, x: newX, y: newY });
    };
    const onUp = () => {
      resizeRef.current.isResizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [win.id, win.width, win.height, win.x, win.y, win.isMaximized, onUpdate]);

  const handleMaximize = () => {
    if (win.isMaximized) {
      onUpdate(win.id, { isMaximized: false, ...prevState });
    } else {
      setPrevState({ x: win.x, y: win.y, width: win.width, height: win.height });
      onUpdate(win.id, { isMaximized: true, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 42 });
    }
  };

  const handleClose = () => {
    if (windowRef.current) {
      animate(windowRef.current, {
        opacity: [1, 0], scale: [1, 0.94], duration: 130, ease: 'inCubic',
        onComplete: () => onClose(win.id),
      });
    } else {
      onClose(win.id);
    }
  };

  if (win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100vh - 42px)', zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      ref={windowRef}
      className={`window ${win.isFocused ? 'focused' : 'unfocused'}`}
      style={style}
      onClick={() => onFocus(win.id)}
    >
      <div className="window-titlebar" onMouseDown={handleMouseDownDrag} onDoubleClick={handleMaximize}>
        <div className="window-icon">
          <AppIcon icon={win.icon} size={14} color="currentColor" />
        </div>
        <div className="window-title">{win.title}</div>
        <div className="window-controls">
          <button className="wc-btn minimize" onClick={e => { e.stopPropagation(); onMinimize(win.id); }} title="Свернуть">
            <BtnMinimize />
          </button>
          <button className="wc-btn maximize" onClick={e => { e.stopPropagation(); handleMaximize(); }} title="Развернуть">
            <BtnMaximize isMax={win.isMaximized} />
          </button>
          <button className="wc-btn close" onClick={e => { e.stopPropagation(); handleClose(); }} title="Закрыть">
            <BtnClose />
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
      {!win.isMaximized && (
        <>
          <div className="resize-handle n" onMouseDown={e => handleMouseDownResize(e, 'n')} />
          <div className="resize-handle s" onMouseDown={e => handleMouseDownResize(e, 's')} />
          <div className="resize-handle e" onMouseDown={e => handleMouseDownResize(e, 'e')} />
          <div className="resize-handle w" onMouseDown={e => handleMouseDownResize(e, 'w')} />
          <div className="resize-handle ne" onMouseDown={e => handleMouseDownResize(e, 'ne')} />
          <div className="resize-handle nw" onMouseDown={e => handleMouseDownResize(e, 'nw')} />
          <div className="resize-handle se" onMouseDown={e => handleMouseDownResize(e, 'se')} />
          <div className="resize-handle sw" onMouseDown={e => handleMouseDownResize(e, 'sw')} />
        </>
      )}
    </div>
  );
};

export default Window;
