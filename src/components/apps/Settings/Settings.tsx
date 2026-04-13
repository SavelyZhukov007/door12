import React, { useState } from 'react';
import { Switch, Slider, Select, Button, message } from 'antd';
import {
  UserOutlined, BgColorsOutlined, BellOutlined, LockOutlined,
  WifiOutlined, SoundOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { AppProps } from '../../../types';
import './Settings.css';

const { Option } = Select;

type SettingsSection = 'system' | 'personalization' | 'accounts' | 'privacy' | 'about';

const Settings: React.FC<AppProps> = () => {
  const [section, setSection] = useState<SettingsSection>('system');
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(80);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [username, setUsername] = useState('User');

  const nav = [
    { key: 'system', icon: <BellOutlined />, label: 'Система' },
    { key: 'personalization', icon: <BgColorsOutlined />, label: 'Персонализация' },
    { key: 'accounts', icon: <UserOutlined />, label: 'Аккаунты' },
    { key: 'privacy', icon: <LockOutlined />, label: 'Конфиденциальность' },
    { key: 'about', icon: <InfoCircleOutlined />, label: 'О системе' },
  ];

  const renderContent = () => {
    switch (section) {
      case 'system':
        return (
          <div className="settings-section">
            <h2>Система</h2>
            <div className="settings-group">
              <h3><SoundOutlined /> Звук</h3>
              <div className="settings-row">
                <span>Громкость</span>
                <div style={{ width: 200 }}>
                  <Slider value={volume} onChange={setVolume} />
                </div>
                <span>{volume}%</span>
              </div>
            </div>
            <div className="settings-group">
              <h3>Экран</h3>
              <div className="settings-row">
                <span>Яркость</span>
                <div style={{ width: 200 }}>
                  <Slider value={brightness} onChange={setBrightness} />
                </div>
                <span>{brightness}%</span>
              </div>
            </div>
            <div className="settings-group">
              <h3><BellOutlined /> Уведомления</h3>
              <div className="settings-row">
                <span>Включить уведомления</span>
                <Switch checked={notifications} onChange={setNotifications} />
              </div>
            </div>
            <div className="settings-group">
              <h3><WifiOutlined /> Сеть</h3>
              <div className="settings-row">
                <span>Статус</span>
                <span className="status-badge connected">Подключено</span>
              </div>
            </div>
          </div>
        );
      case 'personalization':
        return (
          <div className="settings-section">
            <h2>Персонализация</h2>
            <div className="settings-group">
              <h3>Тема</h3>
              <div className="settings-row">
                <span>Тёмная тема</span>
                <Switch checked={darkMode} onChange={setDarkMode} />
              </div>
            </div>
            <div className="settings-group">
              <h3>Язык</h3>
              <div className="settings-row">
                <span>Язык системы</span>
                <Select value={language} onChange={setLanguage} style={{ width: 160 }}>
                  <Option value="ru">Русский</Option>
                  <Option value="en">English</Option>
                </Select>
              </div>
            </div>
            <div className="settings-group">
              <h3>Цвет акцента</h3>
              <div className="color-grid">
                {['#0066cc', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#ff5722'].map(c => (
                  <div key={c} className="color-swatch" style={{ background: c }} onClick={() => message.success(`Цвет изменён`)} />
                ))}
              </div>
            </div>
          </div>
        );
      case 'accounts':
        return (
          <div className="settings-section">
            <h2>Аккаунты</h2>
            <div className="settings-group">
              <div className="account-card">
                <div className="account-avatar">{username[0].toUpperCase()}</div>
                <div>
                  <div className="account-name">{username}</div>
                  <div className="account-role">Администратор</div>
                </div>
              </div>
            </div>
            <div className="settings-group">
              <h3>Имя пользователя</h3>
              <div className="settings-row">
                <input
                  className="settings-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <Button type="primary" size="small" onClick={() => message.success('Сохранено')}>Изменить</Button>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Конфиденциальность</h2>
            <div className="settings-group">
              {[
                'Отправка диагностических данных',
                'Геолокация',
                'История активности',
                'Персонализированная реклама',
              ].map(item => (
                <div key={item} className="settings-row">
                  <span>{item}</span>
                  <Switch defaultChecked={false} />
                </div>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="settings-section">
            <h2>О системе</h2>
            <div className="settings-group about-group">
              <div className="about-logo">Door 12</div>
              <div className="about-version">Версия 1.0.0 (Сборка 24000)</div>
              <table className="about-table">
                <tbody>
                  {[
                    ['ОС', 'Door 12'],
                    ['Версия', '1.0.0'],
                    ['Редакция', 'Professional'],
                    ['Тип системы', '64-разрядная'],
                    ['Процессор', 'Virtual CPU @ 3.0 GHz'],
                    ['ОЗУ', '8.00 ГБ'],
                    ['Разработчик', 'Door 12 Dev Team'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="about-key">{k}</td>
                      <td className="about-val">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="settings">
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">Параметры</div>
        {nav.map(item => (
          <div
            key={item.key}
            className={`settings-nav-item ${section === item.key ? 'active' : ''}`}
            onClick={() => setSection(item.key as SettingsSection)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="settings-content">{renderContent()}</div>
    </div>
  );
};

export default Settings;
