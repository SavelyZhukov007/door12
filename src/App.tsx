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

import { AppWindow, AppDefinition, DesktopIcon, FileSystemNode, Process, UsbDevice } from './types';
import { initialFileSystem, generateId, deleteNode } from './store/fileSystem';

import './index.css';

const APP_REGISTRY: AppDefinition[] = [
  { id: 'calculator', name: 'Калькулятор', icon: '🧮', component: Calculator as any, defaultWidth: 320, defaultHeight: 500, minWidth: 280, minHeight: 420 },
  { id: 'notepad', name: 'Блокнот', icon: '📝', component: Notepad as any, defaultWidth: 680, defaultHeight: 520, minWidth: 360, minHeight: 300 },
  { id: 'explorer', name: 'Проводник', icon: '📁', component: FileExplorer as any, defaultWidth: 900, defaultHeight: 560, minWidth: 520, minHeight: 320, singleInstance: true },
  { id: 'settings', name: 'Параметры', icon: '⚙️', component: Settings as any, defaultWidth: 780, defaultHeight: 560, minWidth: 500, minHeight: 400, singleInstance: true },
  { id: 'terminal', name: 'Терминал', icon: '💻', component: Terminal as any, defaultWidth: 720, defaultHeight: 480, minWidth: 400, minHeight: 280 },
  { id: 'taskmanager', name: 'Диспетчер задач', icon: '📊', component: TaskManager as any, defaultWidth: 860, defaultHeight: 560, minWidth: 520, minHeight: 340, singleInstance: true },
  { id: 'system-monitor', name: 'Системный монитор', icon: '🖥️', component: SystemMonitorApp as any, defaultWidth: 760, defaultHeight: 520, minWidth: 540, minHeight: 360, singleInstance: true },
  { id: 'resource-monitor', name: 'Монитор ресурсов', icon: '📈', component: ResourceMonitorApp as any, defaultWidth: 780, defaultHeight: 520, minWidth: 560, minHeight: 360, singleInstance: true },
  { id: 'camera', name: 'Камера', icon: '📷', component: CameraApp as any, defaultWidth: 760, defaultHeight: 540, minWidth: 500, minHeight: 340, singleInstance: true },
  { id: 'usb-manager', name: 'USB Менеджер', icon: '🔌', component: UsbManagerApp as any, defaultWidth: 720, defaultHeight: 480, minWidth: 500, minHeight: 320, singleInstance: true },
  { id: 'racing', name: 'Гонки', icon: '🏎', component: Racing as any, defaultWidth: 800, defaultHeight: 560, minWidth: 800, minHeight: 560, singleInstance: true },
];

const INITIAL_DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'di-explorer', name: 'Проводник', icon: '📁', appId: 'explorer', x: 20, y: 20 },
  { id: 'di-notepad', name: 'Блокнот', icon: '📝', appId: 'notepad', x: 20, y: 110 },
  { id: 'di-calc', name: 'Калькулятор', icon: '🧮', appId: 'calculator', x: 20, y: 200 },
  { id: 'di-terminal', name: 'Терминал', icon: '💻', appId: 'terminal', x: 20, y: 290 },
  { id: 'di-settings', name: 'Параметры', icon: '⚙️', appId: 'settings', x: 20, y: 380 },
  { id: 'di-taskmanager', name: 'Диспетчер задач', icon: '📊', appId: 'taskmanager', x: 20, y: 470 },
  { id: 'di-sysmon', name: 'Системный монитор', icon: '🖥️', appId: 'system-monitor', x: 20, y: 560 },
  { id: 'di-camera', name: 'Камера', icon: '📷', appId: 'camera', x: 20, y: 650 },
  { id: 'di-usb', name: 'USB Менеджер', icon: '🔌', appId: 'usb-manager', x: 120, y: 110 },
  { id: 'di-welcome', name: 'Welcome.txt', icon: '📄', fileNodeId: 'welcome-txt', x: 120, y: 20 },
  { id: 'di-racing', name: 'Гонки', icon: '🏎', appId: 'racing', x: 120, y: 200 },
];

const WALLPAPERS = [
  'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #0a3d62 70%, #1a1a2e 100%)',
  'linear-gradient(135deg, #1a0533 0%, #16213e 40%, #0f3460 80%, #533483 100%)',
  'linear-gradient(135deg, #0b0c10 0%, #1f2833 50%, #45a29e 100%)',
];

let zCounter = 100;

const App: React.FC = () => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(initialFileSystem);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>(INITIAL_DESKTOP_ICONS);
  const [bootDone, setBootDone] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([
    {
      id: 'proc-0',
      pid: 0,
      appId: 'system',
      name: 'System Idle',
      icon: '🕒',
      status: 'Background',
      cpu: 4,
      memory: 18,
      priority: 'Low',
      description: 'Фоновый процесс простоя системы.',
      startTime: Date.now(),
    },
    {
      id: 'proc-1',
      pid: 1,
      appId: 'shell',
      name: 'Shell',
      icon: '⚙️',
      status: 'Running',
      cpu: 6,
      memory: 40,
      priority: 'Normal',
      description: 'Основной интерфейс ОС.',
      startTime: Date.now(),
    },
  ]);
  const [usbDevices, setUsbDevices] = useState<UsbDevice[]>([]);
  const [wallpaper] = useState(WALLPAPERS[0]);
  const pidRef = useRef(100);

  const systemInfo = useMemo(() => ({
    cpuUsage: Math.min(100, processes.reduce((sum, proc) => sum + proc.cpu, 0)),
    memoryUsage: Math.min(100, Math.round(processes.reduce((sum, proc) => sum + proc.memory, 0) / 16)),
    processCount: processes.length,
    usbCount: usbDevices.length,
  }), [processes, usbDevices]);

  useEffect(() => {
    const el = document.getElementById('boot-screen');
    if (!el) { setBootDone(true); return; }
    setTimeout(() => {
      animate(el, {
        opacity: [1, 0],
        duration: 600,
        ease: 'inCubic',
        onComplete: () => {
          el.style.display = 'none';
          setBootDone(true);
        },
      });
    }, 1800);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProcesses(prev => prev.map(proc => {
        if (proc.status === 'Stopped') return proc;
        if (proc.appId === 'system' && proc.name === 'System Idle') {
          const activeLoad = prev.filter(p => p.status === 'Running').reduce((sum, p) => sum + p.cpu, 0);
          return { ...proc, cpu: Math.max(1, 18 - Math.round(activeLoad / 6)), memory: 18 };
        }

        if (proc.status === 'Suspended') {
          return { ...proc, cpu: Math.max(1, Math.round(proc.cpu * 0.4)), memory: Math.max(12, Math.round(proc.memory * 0.78)) };
        }

        if (proc.status === 'Background') {
          return { ...proc, cpu: Math.max(1, Math.round(proc.cpu * 0.45)), memory: Math.max(14, Math.round(proc.memory * 0.84)) };
        }

        const weights: Record<string, number> = {
          calculator: 6,
          notepad: 9,
          explorer: 12,
          terminal: 8,
          taskmanager: 9,
          'system-monitor': 8,
          'resource-monitor': 10,
          camera: 14,
          'usb-manager': 5,
          settings: 7,
          racing: 22,
        };

        const weight = weights[proc.appId] ?? 6;
        const nextCpu = Math.min(95, Math.max(3, weight + Math.round(Math.random() * 8)));
        const nextMemory = Math.min(420, Math.max(24, weight * 5 + Math.round(Math.random() * 16)));
        return { ...proc, cpu: nextCpu, memory: nextMemory };
      }));
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  const createProcess = useCallback((appId: string, name: string, icon: string, windowId?: string): Process => {
    pidRef.current += 1;
    return {
      id: generateId(),
      pid: pidRef.current,
      appId,
      name,
      icon,
      windowId,
      status: 'Running',
      cpu: 5 + Math.round(Math.random() * 10),
      memory: 38 + Math.round(Math.random() * 24),
      priority: 'Normal',
      description: `Процесс ${name}`,
      startTime: Date.now(),
    };
  }, []);

  const launchApp = useCallback((appId: string, extraProps?: Record<string, any>) => {
    const def = APP_REGISTRY.find(a => a.id === appId);
    if (!def) return;

    const existing = def.singleInstance ? windows.find(w => w.appId === appId) : undefined;
    if (existing) {
      setWindows(prev => prev.map(w => ({
        ...w,
        isFocused: w.id === existing.id,
        isMinimized: w.id === existing.id ? false : w.isMinimized,
        zIndex: w.id === existing.id ? ++zCounter : w.zIndex,
      })));
      setProcesses(prev => prev.map(proc => proc.windowId === existing.id ? { ...proc, status: 'Running' } : proc));
      return;
    }

    const cx = window.innerWidth / 2 - def.defaultWidth / 2 + (Math.random() - 0.5) * 80;
    const cy = (window.innerHeight - 48) / 2 - def.defaultHeight / 2 + (Math.random() - 0.5) * 60;
    const newWin: AppWindow = {
      id: generateId(),
      appId,
      title: def.name,
      icon: def.icon,
      x: Math.max(0, cx),
      y: Math.max(0, cy),
      width: def.defaultWidth,
      height: def.defaultHeight,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: ++zCounter,
      extraProps,
    };

    setWindows(prev => prev.map(w => ({ ...w, isFocused: false })).concat(newWin));
    setProcesses(prev => [...prev, createProcess(appId, def.name, def.icon, newWin.id)]);
  }, [createProcess, windows]);

  const openFile = useCallback((node: FileSystemNode) => {
    if (node.type === 'folder') {
      launchApp('explorer');
    } else {
      launchApp('notepad', { fileContent: node.content || '', fileName: node.name });
    }
  }, [launchApp]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      isFocused: w.id === id,
      isMinimized: w.id === id ? false : w.isMinimized,
      zIndex: w.id === id ? ++zCounter : w.zIndex,
    })));
    setProcesses(prev => prev.map(proc => proc.windowId === id ? { ...proc, status: 'Running' } : proc));
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setProcesses(prev => prev.map(proc => proc.windowId === id ? { ...proc, status: 'Stopped', cpu: 0, memory: 0 } : proc));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true, isFocused: false } : w));
    setProcesses(prev => prev.map(proc => proc.windowId === id ? { ...proc, status: 'Background' } : proc));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<AppWindow>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const killProcess = useCallback((processId: string) => {
    const target = processes.find(proc => proc.id === processId);
    setProcesses(prev => prev.filter(proc => proc.id !== processId));
    if (target?.windowId) {
      setWindows(prev => prev.filter(w => w.id !== target.windowId));
    }
  }, [processes]);

  const suspendProcess = useCallback((processId: string) => {
    const target = processes.find(proc => proc.id === processId);
    setProcesses(prev => prev.map(proc => proc.id === processId ? { ...proc, status: 'Suspended', cpu: Math.max(1, Math.round(proc.cpu * 0.4)) } : proc));
    if (target?.windowId) {
      setWindows(prev => prev.map(w => w.id === target.windowId ? { ...w, isMinimized: true, isFocused: false } : w));
    }
  }, [processes]);

  const resumeProcess = useCallback((processId: string) => {
    const target = processes.find(proc => proc.id === processId);
    setProcesses(prev => prev.map(proc => proc.id === processId ? { ...proc, status: 'Running' } : proc));
    if (target?.windowId) {
      focusWindow(target.windowId);
    }
  }, [focusWindow, processes]);

  const setPriority = useCallback((processId: string, priority: 'Low' | 'Normal' | 'High') => {
    setProcesses(prev => prev.map(proc => proc.id === processId ? { ...proc, priority } : proc));
  }, []);

  const mountUsb = useCallback(() => {
    if (usbDevices.some(device => device.mounted)) return;
    const usbId = `usb-${generateId()}`;
    const usbRoot: FileSystemNode = {
      id: usbId,
      name: 'USB Drive',
      type: 'folder',
      parentId: 'root',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      children: [],
    };
    const usbReadme: FileSystemNode = {
      id: `${usbId}-readme`,
      name: 'USB-README.txt',
      type: 'file',
      extension: 'txt',
      parentId: usbId,
      content: 'Виртуальная флешка подключена. Это пример виртуальных данных.',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: 256,
    };
    const usbPhoto: FileSystemNode = {
      id: `${usbId}-photo`,
      name: 'Photo-Sample.png',
      type: 'file',
      extension: 'png',
      parentId: usbId,
      content: 'virtual-image-content',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: 1024,
    };

    setFileSystem(prev => [...prev, usbRoot, usbReadme, usbPhoto]);
    setUsbDevices(prev => [...prev, { id: usbId, name: 'Виртуальная флешка', label: 'SanDisk 32GB', mounted: true, rootId: usbId }]);
    setDesktopIcons(prev => [...prev, { id: `di-${usbId}`, name: 'USB Drive', icon: '🔌', fileNodeId: usbId, x: 160, y: 20 }]);
  }, [usbDevices]);

  const ejectUsb = useCallback((id: string) => {
    setUsbDevices(prev => prev.filter(device => device.id !== id));
    setFileSystem(prev => deleteNode(prev, id));
    setDesktopIcons(prev => prev.filter(icon => icon.fileNodeId !== id));
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="os-root">
        <div id="boot-screen" className="boot-screen">
          <div className="boot-logo">Door 12</div>
          <div className="boot-spinner">
            <div className="boot-dot" /><div className="boot-dot" /><div className="boot-dot" />
          </div>
        </div>

        {bootDone && (
          <>
            <Desktop
              icons={desktopIcons}
              fileSystem={fileSystem}
              onIconsChange={setDesktopIcons}
              onFileSystemChange={setFileSystem}
              onOpenApp={launchApp}
              onOpenFile={openFile}
              wallpaper={wallpaper}
            />

            {windows.map(win => {
              const def = APP_REGISTRY.find(a => a.id === win.appId);
              if (!def) return null;
              const AppComponent = def.component;
              return (
                <Window
                  key={win.id}
                  window={win}
                  onFocus={focusWindow}
                  onClose={closeWindow}
                  onMinimize={minimizeWindow}
                  onMaximize={maximizeWindow}
                  onUpdate={updateWindow}
                >
                  <AppComponent
                    windowId={win.id}
                    fileSystem={fileSystem}
                    onFileSystemChange={setFileSystem}
                    onOpenFile={openFile}
                    extraProps={{
                      processes,
                      usbDevices,
                      systemInfo,
                      onMountUsb: mountUsb,
                      onEjectUsb: ejectUsb,
                      onKillProcess: killProcess,
                      onSuspendProcess: suspendProcess,
                      onResumeProcess: resumeProcess,
                      onSetPriority: setPriority,
                      onOpenApp: launchApp,
                    }}
                  />
                </Window>
              );
            })}

            <Taskbar
              windows={windows}
              apps={APP_REGISTRY}
              onAppLaunch={launchApp}
              onWindowFocus={focusWindow}
              onWindowMinimize={minimizeWindow}
            />
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;
