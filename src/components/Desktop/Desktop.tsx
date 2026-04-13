import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { DesktopIcon, FileSystemNode } from '../../types';
import { getChildren, generateId, addNode } from '../../store/fileSystem';
import './Desktop.css';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'desktop' | 'icon';
  targetId?: string;
}

interface DesktopProps {
  icons: DesktopIcon[];
  fileSystem: FileSystemNode[];
  onIconsChange: (icons: DesktopIcon[]) => void;
  onFileSystemChange: (nodes: FileSystemNode[]) => void;
  onOpenApp: (appId: string) => void;
  onOpenFile: (node: FileSystemNode) => void;
  wallpaper: string;
}

const Desktop: React.FC<DesktopProps> = ({
  icons, fileSystem, onIconsChange, onFileSystemChange, onOpenApp, onOpenFile, wallpaper,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, type: 'desktop' });
  const iconsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const desktopFiles = getChildren(fileSystem, 'desktop');
    const existingIds = new Set(icons.map(i => i.fileNodeId));
    const newIcons = desktopFiles
      .filter(f => !existingIds.has(f.id))
      .map((f, i) => ({
        id: generateId(),
        name: f.name,
        icon: f.type === 'folder' ? '📁' : '📄',
        fileNodeId: f.id,
        x: 20 + (i % 2) * 100,
        y: 20 + Math.floor(i / 2) * 90,
      }));
    if (newIcons.length > 0) onIconsChange([...icons, ...newIcons]);
  }, [fileSystem, icons, onIconsChange]);

  useEffect(() => {
    iconsRef.current.forEach((el, id) => {
      if (el) {
        animate(el, { opacity: [0, 1], translateY: [12, 0], duration: 300, ease: 'outCubic', delay: Math.random() * 100 });
      }
    });
  }, []);

  const handleDesktopClick = () => {
    setSelected(null);
    setContextMenu(m => ({ ...m, visible: false }));
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'desktop' });
  };

  const handleIconContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(id);
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type: 'icon', targetId: id });
  };

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.appId) {
      onOpenApp(icon.appId);
    } else if (icon.fileNodeId) {
      const node = fileSystem.find(n => n.id === icon.fileNodeId);
      if (node) onOpenFile(node);
    }
  };

  const handleIconDragStart = useCallback((e: React.MouseEvent, icon: DesktopIcon) => {
    e.preventDefault();
    const startX = e.clientX - icon.x;
    const startY = e.clientY - icon.y;
    setSelected(icon.id);

    const onMove = (ev: MouseEvent) => {
      onIconsChange(icons.map(i => i.id === icon.id
        ? { ...i, x: Math.max(0, ev.clientX - startX), y: Math.max(0, ev.clientY - startY) }
        : i
      ));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [icons, onIconsChange]);

  const deleteIcon = (id: string) => {
    const icon = icons.find(i => i.id === id);
    if (icon?.fileNodeId) {
      onFileSystemChange(fileSystem.filter(n => n.id !== icon.fileNodeId));
    }
    onIconsChange(icons.filter(i => i.id !== id));
    setContextMenu(m => ({ ...m, visible: false }));
  };

  const createNewFile = () => {
    const name = `Новый документ ${Date.now().toString().slice(-4)}.txt`;
    const node: FileSystemNode = {
      id: generateId(),
      name,
      type: 'file',
      extension: 'txt',
      parentId: 'desktop',
      content: '',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: 0,
    };
    onFileSystemChange(addNode(fileSystem, node));
    setContextMenu(m => ({ ...m, visible: false }));
  };

  const createNewFolder = () => {
    const name = `Новая папка ${Date.now().toString().slice(-4)}`;
    const node: FileSystemNode = {
      id: generateId(),
      name,
      type: 'folder',
      parentId: 'desktop',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      children: [],
    };
    onFileSystemChange(addNode(fileSystem, node));
    setContextMenu(m => ({ ...m, visible: false }));
  };

  return (
    <div
      className="desktop"
      style={{ backgroundImage: wallpaper }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      {icons.map(icon => (
        <div
          key={icon.id}
          ref={el => { if (el) iconsRef.current.set(icon.id, el); }}
          className={`desktop-icon ${selected === icon.id ? 'selected' : ''}`}
          style={{ left: icon.x, top: icon.y }}
          onClick={e => { e.stopPropagation(); setSelected(icon.id); setContextMenu(m => ({ ...m, visible: false })); }}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onMouseDown={e => e.button === 0 && handleIconDragStart(e, icon)}
          onContextMenu={e => handleIconContextMenu(e, icon.id)}
        >
          <div className="desktop-icon-img">{icon.icon}</div>
          <div className="desktop-icon-label">{icon.name}</div>
        </div>
      ))}

      {contextMenu.visible && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          {contextMenu.type === 'desktop' ? (
            <>
              <div className="ctx-item" onClick={() => { onOpenApp('explorer'); setContextMenu(m => ({ ...m, visible: false })); }}>📁 Открыть проводник</div>
              <div className="ctx-item" onClick={() => { onOpenApp('taskmanager'); setContextMenu(m => ({ ...m, visible: false })); }}>📊 Открыть диспетчер задач</div>
              <div className="ctx-item" onClick={() => { onOpenApp('system-monitor'); setContextMenu(m => ({ ...m, visible: false })); }}>🖥️ Системный монитор</div>
              <div className="ctx-item" onClick={() => { onOpenApp('usb-manager'); setContextMenu(m => ({ ...m, visible: false })); }}>🔌 USB Менеджер</div>
              <div className="ctx-divider" />
              <div className="ctx-item" onClick={createNewFolder}>📁 Создать папку</div>
              <div className="ctx-item" onClick={createNewFile}>📄 Создать текстовый файл</div>
              <div className="ctx-divider" />
              <div className="ctx-item" onClick={() => { onOpenApp('settings'); setContextMenu(m => ({ ...m, visible: false })); }}>⚙️ Параметры</div>
              <div className="ctx-item" onClick={() => { window.location.reload(); }}>🔄 Обновить</div>
            </>
          ) : (
            <>
              <div className="ctx-item" onClick={() => {
                const icon = icons.find(i => i.id === contextMenu.targetId);
                if (icon) handleIconDoubleClick(icon);
                setContextMenu(m => ({ ...m, visible: false }));
              }}>▶️ Открыть</div>
              <div className="ctx-divider" />
              <div className="ctx-item danger" onClick={() => contextMenu.targetId && deleteIcon(contextMenu.targetId)}>🗑️ Удалить</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Desktop;
