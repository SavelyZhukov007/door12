import React from 'react';

interface P { size?: number; color?: string; }

export const IcoCalculator = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.5" />
        <rect x="7" y="5" width="10" height="4" rx="1" fill={color} opacity=".5" />
        <rect x="7" y="12" width="3" height="2.5" rx=".5" fill={color} />
        <rect x="10.5" y="12" width="3" height="2.5" rx=".5" fill={color} />
        <rect x="14" y="12" width="3" height="2.5" rx=".5" fill={color} />
        <rect x="7" y="16" width="3" height="2.5" rx=".5" fill={color} />
        <rect x="10.5" y="16" width="3" height="2.5" rx=".5" fill={color} />
        <rect x="14" y="14.5" width="3" height="4" rx=".5" fill={color} />
    </svg>
);

export const IcoNotepad = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="1.5" />
        <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoFolder = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const IcoSettings = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
);

export const IcoTerminal = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.5" />
        <polyline points="6,8 10,12 6,16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="13" y1="16" x2="18" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoTaskManager = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
        <polyline points="7,16 10,10 13,13 17,7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export const IcoSysmon = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
        <line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="5,13 8,8 11,11 14,7 19,10" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export const IcoResmon = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.5" />
        <rect x="5" y="13" width="3" height="6" rx=".5" fill={color} opacity=".7" />
        <rect x="10.5" y="9" width="3" height="10" rx=".5" fill={color} opacity=".7" />
        <rect x="16" y="5" width="3" height="14" rx=".5" fill={color} opacity=".5" />
    </svg>
);

export const IcoCamera = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const IcoUsb = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2v12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="8,6 12,2 16,6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M8 10H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M16 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="18" r="3" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const IcoRacing = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 12l3-5h12l3 5-3 4H6z" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="7.5" cy="16.5" r="1.5" fill={color} />
        <circle cx="16.5" cy="16.5" r="1.5" fill={color} />
        <line x1="9" y1="7" x2="8" y2="12" stroke={color} strokeWidth="1" opacity=".5" />
        <line x1="15" y1="7" x2="16" y2="12" stroke={color} strokeWidth="1" opacity=".5" />
    </svg>
);

export const IcoSnake = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 8a3 3 0 0 1 3-3h3v5h5V5h3a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8z" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="7" cy="7.5" r="1" fill={color} />
        <circle cx="17" cy="7.5" r="1" fill={color} />
    </svg>
);

export const IcoTetris = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="5" height="5" rx=".5" fill={color} opacity=".9" />
        <rect x="10" y="3" width="5" height="5" rx=".5" fill={color} opacity=".6" />
        <rect x="10" y="10" width="5" height="5" rx=".5" fill={color} opacity=".9" />
        <rect x="17" y="10" width="5" height="5" rx=".5" fill={color} opacity=".5" />
        <rect x="3" y="16" width="5" height="5" rx=".5" fill={color} opacity=".6" />
        <rect x="10" y="17" width="5" height="5" rx=".5" fill={color} opacity=".8" />
    </svg>
);

export const IcoMinesweeper = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
        <line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
);

export const IcoPong = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.5" />
        <rect x="4" y="8" width="2" height="8" rx="1" fill={color} />
        <rect x="18" y="8" width="2" height="8" rx="1" fill={color} />
        <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
);

export const IcoFile = ({ size = 20, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="1.5" />
        <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
);

export const IcoWifi = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="20" r="1" fill={color} />
    </svg>
);

export const IcoVolume = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoBattery = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="7" width="18" height="11" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M23 11v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <rect x="3" y="9" width="12" height="7" rx="1" fill={color} opacity=".5" />
    </svg>
);

export const IcoPower = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="2" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoWindows = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
        <path d="M0 0h7v7H0zM9 0h7v7H9zM0 9h7v7H0zM9 9h7v7H9z" />
    </svg>
);

export const IcoTrash = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoNewFolder = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.5" />
        <line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoNewFile = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="1.5" />
        <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="12" y1="12" x2="12" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="15" x2="15" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const IcoOpen = ({ size = 16, color = 'currentColor' }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="15,3 21,3 21,9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="10" y1="14" x2="21" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const iconMap: Record<string, React.FC<P>> = {
    calculator: IcoCalculator,
    notepad: IcoNotepad,
    explorer: IcoFolder,
    settings: IcoSettings,
    terminal: IcoTerminal,
    taskmanager: IcoTaskManager,
    sysmon: IcoSysmon,
    resmon: IcoResmon,
    camera: IcoCamera,
    usb: IcoUsb,
    racing: IcoRacing,
    snake: IcoSnake,
    tetris: IcoTetris,
    minesweeper: IcoMinesweeper,
    pong: IcoPong,
    file: IcoFile,
};

export const AppIcon: React.FC<{ icon: string; size?: number; color?: string }> = ({ icon, size = 20, color = 'currentColor' }) => {
    const C = iconMap[icon] ?? IcoFile;
    return <C size={size} color={color} />;
};