import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { AppWindow, AppDefinition } from '../../types';
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
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getWindowsForApp = (appId: string) => windows.filter(w => w.appId === appId);

  return (
    <>
      {startMenuOpen && (
        <div className="start-menu-overlay" onClick={() => setStartMenuOpen(false)}>
          <div className="start-menu" onClick={e => e.stopPropagation()}>
            <div className="start-menu-header">Door 12</div>
            <div className="start-menu-search">
              <input
                placeholder="Поиск приложений..."
                className="start-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="start-menu-section-title">Все приложения</div>
            <div className="start-menu-apps">
              {apps
                .filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(app => (
                  <div key={app.id} className="start-app-item" onClick={() => { onAppLaunch(app.id); setStartMenuOpen(false); }}>
                    <span className="start-app-icon">{app.icon}</span>
                    <span>{app.name}</span>
                  </div>
                ))}
            </div>
            <div className="start-menu-footer">
              <div className="start-footer-btn" onClick={() => { setStartMenuOpen(false); }}>
                <span>⚙</span> Параметры
              </div>
              <div className="start-footer-btn power">
                <span>⏻</span> Питание
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="taskbar">
        <div className="taskbar-start" onClick={() => setStartMenuOpen(v => !v)}>
          <div className="start-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 0h7v7H0zM9 0h7v7H9zM0 9h7v7H0zM9 9h7v7H9z" />
            </svg>
          </div>
        </div>

        <div className="taskbar-center">
          <div className="taskbar-pinned">
            {pinnedApps.map(appId => {
              const app = apps.find(a => a.id === appId);
              if (!app) return null;
              const appWindows = getWindowsForApp(appId);
              const hasWindows = appWindows.length > 0;
              const hasFocused = appWindows.some(w => w.isFocused && !w.isMinimized);
              return (
                <Tooltip key={appId} title={app.name} placement="top">
                  <div
                    className={`taskbar-icon ${hasWindows ? 'has-windows' : ''} ${hasFocused ? 'focused' : ''}`}
                    onClick={() => {
                      if (appWindows.length === 0) {
                        onAppLaunch(appId);
                      } else {
                        const win = appWindows[0];
                        if (win.isMinimized || !win.isFocused) {
                          onWindowFocus(win.id);
                        } else {
                          onWindowMinimize(win.id);
                        }
                      }
                    }}
                  >
                    <span>{app.icon}</span>
                    {hasWindows && <div className="taskbar-dot" />}
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {windows.filter(w => !pinnedApps.includes(w.appId)).map(win => (
            <Tooltip key={win.id} title={win.title} placement="top">
              <div
                className={`taskbar-icon has-windows ${win.isFocused && !win.isMinimized ? 'focused' : ''}`}
                onClick={() => {
                  if (win.isMinimized || !win.isFocused) onWindowFocus(win.id);
                  else onWindowMinimize(win.id);
                }}
              >
                <span>{win.icon}</span>
                <div className="taskbar-dot" />
              </div>
            </Tooltip>
          ))}
        </div>

        <div className="taskbar-right">
          <div className="taskbar-sys-icons">
            <span title="Сеть">🌐</span>
            <span title="Звук">🔊</span>
            <span title="Батарея">🔋</span>
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
