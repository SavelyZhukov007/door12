import React, { useState, useEffect } from 'react';
import { AppWindow, AppDefinition } from '../../types';
import { AppIcon } from '../Icons';
import { IcoSettings, IcoPower, IcoWifi, IcoVolume, IcoBattery, IcoWindows } from '../Icons';
import './Taskbar.css';

interface TaskbarProps {
  windows: AppWindow[];
  apps: AppDefinition[];
  onAppLaunch: (appId: string) => void;
  onWindowFocus: (id: string) => void;
  onWindowMinimize: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, apps, onAppLaunch, onWindowFocus, onWindowMinimize }) => {
  const [time, setTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinnedApps = ['calculator', 'notepad', 'explorer', 'taskmanager', 'system-monitor', 'resource-monitor', 'camera', 'usb-manager'];

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const getWindowsForApp = (appId: string) => windows.filter(w => w.appId === appId);

  return (
    <>
      {startMenuOpen && (
        <div className="start-menu-overlay" onClick={() => { setStartMenuOpen(false); setSearchTerm(''); }}>
          <div className="start-menu" onClick={e => e.stopPropagation()}>
            <div className="start-menu-header">Door 12</div>
            <div className="start-menu-search">
              <input
                placeholder="/ искать приложения..."
                className="start-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="start-menu-section-title">приложения</div>
            <div className="start-menu-apps">
              {apps
                .filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(app => (
                  <div key={app.id} className="start-app-item" onClick={() => { onAppLaunch(app.id); setStartMenuOpen(false); setSearchTerm(''); }}>
                    <span className="start-app-icon">
                      <AppIcon icon={app.icon} size={16} color="currentColor" />
                    </span>
                    <span>{app.name}</span>
                  </div>
                ))}
            </div>
            <div className="start-menu-footer">
              <div className="start-footer-btn" onClick={() => { onAppLaunch('settings'); setStartMenuOpen(false); }}>
                <IcoSettings size={12} color="currentColor" /> параметры
              </div>
              <div className="start-footer-btn power" onClick={() => window.location.reload()}>
                <IcoPower size={12} color="currentColor" /> выход
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="taskbar">
        <div className="taskbar-start">
          <div
            className={`start-btn ${startMenuOpen ? 'active' : ''}`}
            onClick={() => setStartMenuOpen(v => !v)}
            title="Пуск"
          >
            <IcoWindows size={15} color="currentColor" />
          </div>
        </div>

        <div className="taskbar-sep" />

        <div className="taskbar-center">
          <div className="taskbar-pinned">
            {pinnedApps.map(appId => {
              const app = apps.find(a => a.id === appId);
              if (!app) return null;
              const appWindows = getWindowsForApp(appId);
              const hasWindows = appWindows.length > 0;
              const hasFocused = appWindows.some(w => w.isFocused && !w.isMinimized);
              return (
                <div
                  key={appId}
                  title={app.name}
                  className={`taskbar-icon ${hasWindows ? 'has-windows' : ''} ${hasFocused ? 'focused' : ''}`}
                  onClick={() => {
                    if (appWindows.length === 0) {
                      onAppLaunch(appId);
                    } else {
                      const win = appWindows[0];
                      if (win.isMinimized || !win.isFocused) onWindowFocus(win.id);
                      else onWindowMinimize(win.id);
                    }
                  }}
                >
                  <AppIcon icon={app.icon} size={16} color="currentColor" />
                </div>
              );
            })}
          </div>

          {windows.filter(w => !pinnedApps.includes(w.appId)).map(win => (
            <div
              key={win.id}
              title={win.title}
              className={`taskbar-icon has-windows ${win.isFocused && !win.isMinimized ? 'focused' : ''}`}
              onClick={() => {
                if (win.isMinimized || !win.isFocused) onWindowFocus(win.id);
                else onWindowMinimize(win.id);
              }}
            >
              <AppIcon icon={win.icon} size={16} color="currentColor" />
            </div>
          ))}
        </div>

        <div className="taskbar-right">
          <div className="taskbar-sys-icons" title="Сеть / Звук / Батарея">
            <IcoWifi size={13} color="currentColor" />
            <IcoVolume size={13} color="currentColor" />
            <IcoBattery size={13} color="currentColor" />
          </div>
          <div className="taskbar-clock">
            <div className="clock-time">{formatTime(time)}</div>
            <div className="clock-date">{formatDate(time)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Taskbar;
