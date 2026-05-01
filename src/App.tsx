import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';
import { animate } from 'animejs';

import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';

import Calculator from './components/apps/Calculator/Calculator';
import Notepad from './components/apps/Notepad/Notepad';
import FileExplorer from './components/apps/FileExplorer/FileExplorer';
import Settings from './components/apps/Settings/Settings';
import Terminal from './components/apps/Terminal/Terminal';
import TaskManager from './components/apps/TaskManager/TaskManager';
import { SystemMonitorApp, ResourceMonitorApp, CameraApp, UsbManagerApp } from './components/apps/SystemApps';
import Racing from './components/apps/Racing/Racing';
import Snake from './components/apps/Snake/Snake';
import Tetris from './components/apps/Tetris/Tetris';
import Minesweeper from './components/apps/Minesweeper/Minesweeper';
import Pong from './components/apps/Pong/Pong';

import { AppWindow, AppDefinition, DesktopIcon, FileSystemNode, Process, UsbDevice } from './types';
import { initialFileSystem, generateId, deleteNode } from './store/fileSystem';

import './index.css';

const APP_REGISTRY: AppDefinition[] = [
  { id: 'calculator', name: 'Калькулятор', icon: 'calculator', component: Calculator as any, defaultWidth: 320, defaultHeight: 500, minWidth: 280, minHeight: 420 },
  { id: 'notepad', name: 'Блокнот', icon: 'notepad', component: Notepad as any, defaultWidth: 680, defaultHeight: 520, minWidth: 360, minHeight: 300 },
  { id: 'explorer', name: 'Проводник', icon: 'explorer', component: FileExplorer as any, defaultWidth: 900, defaultHeight: 560, minWidth: 520, minHeight: 320, singleInstance: true },
  { id: 'settings', name: 'Параметры', icon: 'settings', component: Settings as any, defaultWidth: 780, defaultHeight: 560, minWidth: 500, minHeight: 400, singleInstance: true },
  { id: 'terminal', name: 'Терминал', icon: 'terminal', component: Terminal as any, defaultWidth: 720, defaultHeight: 480, minWidth: 400, minHeight: 280 },
  { id: 'taskmanager', name: 'Диспетчер задач', icon: 'taskmanager', component: TaskManager as any, defaultWidth: 860, defaultHeight: 560, minWidth: 520, minHeight: 340, singleInstance: true },
  { id: 'system-monitor', name: 'Системный монитор', icon: 'sysmon', component: SystemMonitorApp as any, defaultWidth: 760, defaultHeight: 520, minWidth: 540, minHeight: 360, singleInstance: true },
  { id: 'resource-monitor', name: 'Монитор ресурсов', icon: 'resmon', component: ResourceMonitorApp as any, defaultWidth: 780, defaultHeight: 520, minWidth: 560, minHeight: 360, singleInstance: true },
  { id: 'camera', name: 'Камера', icon: 'camera', component: CameraApp as any, defaultWidth: 760, defaultHeight: 540, minWidth: 500, minHeight: 340, singleInstance: true },
  { id: 'usb-manager', name: 'USB Менеджер', icon: 'usb', component: UsbManagerApp as any, defaultWidth: 720, defaultHeight: 480, minWidth: 500, minHeight: 320, singleInstance: true },
  { id: 'racing', name: 'Гонки', icon: 'racing', component: Racing as any, defaultWidth: 800, defaultHeight: 560, minWidth: 800, minHeight: 560, singleInstance: true },
  { id: 'snake', name: 'Змейка', icon: 'snake', component: Snake as any, defaultWidth: 660, defaultHeight: 480, minWidth: 660, minHeight: 480, singleInstance: true },
  { id: 'tetris', name: 'Тетрис', icon: 'tetris', component: Tetris as any, defaultWidth: 460, defaultHeight: 600, minWidth: 460, minHeight: 600, singleInstance: true },
  { id: 'minesweeper', name: 'Сапёр', icon: 'minesweeper', component: Minesweeper as any, defaultWidth: 640, defaultHeight: 440, minWidth: 400, minHeight: 360, singleInstance: true },
  { id: 'pong', name: 'Пинг-Понг', icon: 'pong', component: Pong as any, defaultWidth: 900, defaultHeight: 460, minWidth: 900, minHeight: 460, singleInstance: true },
];

const INITIAL_DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'di-explorer', name: 'Проводник', icon: 'explorer', appId: 'explorer', x: 20, y: 20 },
  { id: 'di-notepad', name: 'Блокнот', icon: 'notepad', appId: 'notepad', x: 20, y: 110 },
  { id: 'di-calc', name: 'Калькулятор', icon: 'calculator', appId: 'calculator', x: 20, y: 200 },
  { id: 'di-terminal', name: 'Терминал', icon: 'terminal', appId: 'terminal', x: 20, y: 290 },
  { id: 'di-settings', name: 'Параметры', icon: 'settings', appId: 'settings', x: 20, y: 380 },
  { id: 'di-taskmanager', name: 'Диспетчер задач', icon: 'taskmanager', appId: 'taskmanager', x: 20, y: 470 },
  { id: 'di-sysmon', name: 'Системный монитор', icon: 'sysmon', appId: 'system-monitor', x: 20, y: 560 },
  { id: 'di-camera', name: 'Камера', icon: 'camera', appId: 'camera', x: 20, y: 650 },
  { id: 'di-usb', name: 'USB Менеджер', icon: 'usb', appId: 'usb-manager', x: 120, y: 110 },
  { id: 'di-welcome', name: 'Welcome.txt', icon: 'file', fileNodeId: 'welcome-txt', x: 120, y: 20 },
  { id: 'di-racing', name: 'Гонки', icon: 'racing', appId: 'racing', x: 120, y: 200 },
  { id: 'di-snake', name: 'Змейка', icon: 'snake', appId: 'snake', x: 120, y: 290 },
  { id: 'di-tetris', name: 'Тетрис', icon: 'tetris', appId: 'tetris', x: 120, y: 380 },
  { id: 'di-minesweeper', name: 'Сапёр', icon: 'minesweeper', appId: 'minesweeper', x: 120, y: 470 },
  { id: 'di-pong', name: 'Пинг-Понг', icon: 'pong', appId: 'pong', x: 120, y: 560 },
];

const WALLPAPERS = [
  'radial-gradient(ellipse at 20% 80%, #1a0a00 0%, #0c0c0c 50%, #050508 100%)',
];

let zCounter = 100;

const App: React.FC = () => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(initialFileSystem);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>(INITIAL_DESKTOP_ICONS);
  const [bootDone, setBootDone] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'proc-0', pid: 0, appId: 'system', name: 'System Idle', icon: 'sysmon', status: 'Background', cpu: 4, memory: 18, priority: 'Low', description: 'Фоновый процесс простоя системы.', startTime: Date.now() },
    { id: 'proc-1', pid: 1, appId: 'shell', name: 'Shell', icon: 'settings', status: 'Running', cpu: 6, memory: 40, priority: 'Normal', description: 'Основной интерфейс ОС.', startTime: Date.now() },
  ]);
  const [usbDevices, setUsbDevices] = useState<UsbDevice[]>([]);
  const [wallpaper] = useState(WALLPAPERS[0]);
  const pidRef = useRef(100);

  const systemInfo = useMemo(() => ({
    cpuUsage: Math.min(100, processes.reduce((s, p) => s + p.cpu, 0)),
    memoryUsage: Math.min(100, Math.round(processes.reduce((s, p) => s + p.memory, 0) / 16)),
    processCount: processes.length,
    usbCount: usbDevices.length,
  }), [processes, usbDevices]);

  useEffect(() => {
    const el = document.getElementById('boot-screen');
    if (!el) { setBootDone(true); return; }
    setTimeout(() => {
      animate(el, { opacity: [1, 0], duration: 600, ease: 'inCubic', onComplete: () => { el.style.display = 'none'; setBootDone(true); } });
    }, 1800);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProcesses(prev => prev.map(proc => {
        if (proc.status === 'Stopped') return proc;
        if (proc.appId === 'system' && proc.name === 'System Idle') {
          const load = prev.filter(p => p.status === 'Running').reduce((s, p) => s + p.cpu, 0);
          return { ...proc, cpu: Math.max(1, 18 - Math.round(load / 6)), memory: 18 };
        }
        if (proc.status === 'Suspended') return { ...proc, cpu: Math.max(1, Math.round(proc.cpu * 0.4)), memory: Math.max(12, Math.round(proc.memory * 0.78)) };
        if (proc.status === 'Background') return { ...proc, cpu: Math.max(1, Math.round(proc.cpu * 0.45)), memory: Math.max(14, Math.round(proc.memory * 0.84)) };
        const weights: Record<string, number> = { calculator: 6, notepad: 9, explorer: 12, terminal: 8, taskmanager: 9, 'system-monitor': 8, 'resource-monitor': 10, camera: 14, 'usb-manager': 5, settings: 7, racing: 22, snake: 8, tetris: 10, minesweeper: 6, pong: 12 };
        const w = weights[proc.appId] ?? 6;
        return { ...proc, cpu: Math.min(95, Math.max(3, w + Math.round(Math.random() * 8))), memory: Math.min(420, Math.max(24, w * 5 + Math.round(Math.random() * 16))) };
      }));
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  const createProcess = useCallback((appId: string, name: string, icon: string, windowId?: string): Process => {
    pidRef.current += 1;
    return { id: generateId(), pid: pidRef.current, appId, name, icon, windowId, status: 'Running', cpu: 5 + Math.round(Math.random() * 10), memory: 38 + Math.round(Math.random() * 24), priority: 'Normal', description: `Процесс ${name}`, startTime: Date.now() };
  }, []);

  const launchApp = useCallback((appId: string, extraProps?: Record<string, any>) => {
    const def = APP_REGISTRY.find(a => a.id === appId);
    if (!def) return;
    const existing = def.singleInstance ? windows.find(w => w.appId === appId) : undefined;
    if (existing) {
      setWindows(prev => prev.map(w => ({ ...w, isFocused: w.id === existing.id, isMinimized: w.id === existing.id ? false : w.isMinimized, zIndex: w.id === existing.id ? ++zCounter : w.zIndex })));
      setProcesses(prev => prev.map(p => p.windowId === existing.id ? { ...p, status: 'Running' } : p));
      return;
    }
    const cx = window.innerWidth / 2 - def.defaultWidth / 2 + (Math.random() - 0.5) * 80;
    const cy = (window.innerHeight - 48) / 2 - def.defaultHeight / 2 + (Math.random() - 0.5) * 60;
    const newWin: AppWindow = { id: generateId(), appId, title: def.name, icon: def.icon, x: Math.max(0, cx), y: Math.max(0, cy), width: def.defaultWidth, height: def.defaultHeight, isMinimized: false, isMaximized: false, isFocused: true, zIndex: ++zCounter, extraProps };
    setWindows(prev => prev.map(w => ({ ...w, isFocused: false })).concat(newWin));
    setProcesses(prev => [...prev, createProcess(appId, def.name, def.icon, newWin.id)]);
  }, [createProcess, windows]);

  const openFile = useCallback((node: FileSystemNode) => {
    if (node.type === 'folder') launchApp('explorer');
    else launchApp('notepad', { fileContent: node.content || '', fileName: node.name });
  }, [launchApp]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => ({ ...w, isFocused: w.id === id, isMinimized: w.id === id ? false : w.isMinimized, zIndex: w.id === id ? ++zCounter : w.zIndex })));
    setProcesses(prev => prev.map(p => p.windowId === id ? { ...p, status: 'Running' } : p));
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setProcesses(prev => prev.map(p => p.windowId === id ? { ...p, status: 'Stopped', cpu: 0, memory: 0 } : p));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true, isFocused: false } : w));
    setProcesses(prev => prev.map(p => p.windowId === id ? { ...p, status: 'Background' } : p));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<AppWindow>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const killProcess = useCallback((processId: string) => {
    const target = processes.find(p => p.id === processId);
    setProcesses(prev => prev.filter(p => p.id !== processId));
    if (target?.windowId) setWindows(prev => prev.filter(w => w.id !== target.windowId));
  }, [processes]);

  const suspendProcess = useCallback((processId: string) => {
    const target = processes.find(p => p.id === processId);
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, status: 'Suspended', cpu: Math.max(1, Math.round(p.cpu * 0.4)) } : p));
    if (target?.windowId) setWindows(prev => prev.map(w => w.id === target.windowId ? { ...w, isMinimized: true, isFocused: false } : w));
  }, [processes]);

  const resumeProcess = useCallback((processId: string) => {
    const target = processes.find(p => p.id === processId);
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, status: 'Running' } : p));
    if (target?.windowId) focusWindow(target.windowId);
  }, [focusWindow, processes]);

  const setPriority = useCallback((processId: string, priority: 'Low' | 'Normal' | 'High') => {
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, priority } : p));
  }, []);

  const mountUsb = useCallback(() => {
    if (usbDevices.some(d => d.mounted)) return;
    const usbId = `usb-${generateId()}`;
    setFileSystem(prev => [...prev,
    { id: usbId, name: 'USB Drive', type: 'folder', parentId: 'root', createdAt: Date.now(), modifiedAt: Date.now(), children: [] },
    { id: `${usbId}-readme`, name: 'USB-README.txt', type: 'file', extension: 'txt', parentId: usbId, content: 'Виртуальная флешка подключена.', createdAt: Date.now(), modifiedAt: Date.now(), size: 256 },
    ]);
    setUsbDevices(prev => [...prev, { id: usbId, name: 'Виртуальная флешка', label: 'SanDisk 32GB', mounted: true, rootId: usbId }]);
    setDesktopIcons(prev => [...prev, { id: `di-${usbId}`, name: 'USB Drive', icon: 'usb', fileNodeId: usbId, x: 160, y: 20 }]);
  }, [usbDevices]);

  const ejectUsb = useCallback((id: string) => {
    setUsbDevices(prev => prev.filter(d => d.id !== id));
    setFileSystem(prev => deleteNode(prev, id));
    setDesktopIcons(prev => prev.filter(i => i.fileNodeId !== id));
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="os-root">
        <div id="boot-screen" className="boot-screen">
          <div className="boot-logo">Door 12</div>
          <div className="boot-tagline">In search for ОСИС!</div>
          <div className="boot-spinner">
            <div className="boot-dot" /><div className="boot-dot" /><div className="boot-dot" />
          </div>
        </div>
        {bootDone && (
          <>
            <Desktop icons={desktopIcons} fileSystem={fileSystem} onIconsChange={setDesktopIcons} onFileSystemChange={setFileSystem} onOpenApp={launchApp} onOpenFile={openFile} wallpaper={wallpaper} />
            {windows.map(win => {
              const def = APP_REGISTRY.find(a => a.id === win.appId);
              if (!def) return null;
              const AppComponent = def.component;
              return (
                <Window key={win.id} window={win} onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} onMaximize={maximizeWindow} onUpdate={updateWindow}>
                  <AppComponent windowId={win.id} fileSystem={fileSystem} onFileSystemChange={setFileSystem} onOpenFile={openFile} extraProps={{ processes, usbDevices, systemInfo, onMountUsb: mountUsb, onEjectUsb: ejectUsb, onKillProcess: killProcess, onSuspendProcess: suspendProcess, onResumeProcess: resumeProcess, onSetPriority: setPriority, onOpenApp: launchApp }} />
                </Window>
              );
            })}
            <Taskbar windows={windows} apps={APP_REGISTRY} onAppLaunch={launchApp} onWindowFocus={focusWindow} onWindowMinimize={minimizeWindow} />
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;