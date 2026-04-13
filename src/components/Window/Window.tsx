import React, { useRef, useState, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { AppWindow } from '../../types';
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

const Window: React.FC<WindowProps> = ({ window: win, onFocus, onClose, onMinimize, onMaximize, onUpdate, children }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ isResizing: false, direction: '', startX: 0, startY: 0, origW: 0, origH: 0, origX: 0, origY: 0 });
  const [prevState, setPrevState] = useState({ x: win.x, y: win.y, width: win.width, height: win.height });
  const prevMaximized = useRef(false);

  useEffect(() => {
    if (windowRef.current) {
      animate(windowRef.current, {
        opacity: [0, 1],
        scale: [0.92, 1],
        duration: 200,
        ease: 'outCubic',
      });
    }
  }, []);

  const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    onFocus(win.id);
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onUpdate(win.id, { x: dragRef.current.origX + dx, y: Math.max(0, dragRef.current.origY + dy) });
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
    resizeRef.current = {
      isResizing: true, direction,
      startX: e.clientX, startY: e.clientY,
      origW: win.width, origH: win.height,
      origX: win.x, origY: win.y,
    };

    const minW = 300;
    const minH = 200;

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current.isResizing) return;
      const { direction: dir, startX, startY, origW, origH, origX, origY } = resizeRef.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
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
      prevMaximized.current = false;
    } else {
      setPrevState({ x: win.x, y: win.y, width: win.width, height: win.height });
      onUpdate(win.id, { isMaximized: true, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 48 });
      prevMaximized.current = true;
    }
  };

  const handleClose = () => {
    if (windowRef.current) {
      animate(windowRef.current, {
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 150,
        ease: 'inCubic',
        onComplete: () => onClose(win.id),
      });
    } else {
      onClose(win.id);
    }
  };

  if (win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100vh - 48px)', zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      ref={windowRef}
      className={`window ${win.isFocused ? 'focused' : 'unfocused'}`}
      style={style}
      onClick={() => onFocus(win.id)}
    >
      <div className="window-titlebar" onMouseDown={handleMouseDownDrag} onDoubleClick={handleMaximize}>
        <div className="window-icon">{win.icon}</div>
        <div className="window-title">{win.title}</div>
        <div className="window-controls">
          <button className="wc-btn minimize" onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}>
            <span>─</span>
          </button>
          <button className="wc-btn maximize" onClick={(e) => { e.stopPropagation(); handleMaximize(); }}>
            <span>{win.isMaximized ? '❐' : '□'}</span>
          </button>
          <button className="wc-btn close" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
            <span>✕</span>
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
