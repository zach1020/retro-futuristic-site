import React, { useState, useEffect, useRef } from 'react';
import type { WindowState } from '../../context/WindowManagerContext';
import { useTime } from '../../context/TimeContext';
import { Monitor } from 'lucide-react';
import { StartMenu } from './StartMenu';

interface TaskbarProps {
    windows: WindowState[];
    activeWindowId: string | null;
    onRestore: (id: string) => void;
    onLaunchApp: (id: string) => void;
    onShutdown: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ windows, activeWindowId, onRestore, onLaunchApp, onShutdown }) => {
    const { time } = useTime();
    const [isStartOpen, setIsStartOpen] = useState(false);
    const startMenuRef = useRef<HTMLDivElement>(null);
    const startButtonRef = useRef<HTMLButtonElement>(null);

    // Close start menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isStartOpen &&
                startMenuRef.current &&
                !startMenuRef.current.contains(event.target as Node) &&
                startButtonRef.current &&
                !startButtonRef.current.contains(event.target as Node)
            ) {
                setIsStartOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStartOpen]);

    const handleLaunch = (appId: string) => {
        onLaunchApp(appId);
        setIsStartOpen(false);
    };

    const handleShutdown = () => {
        setIsStartOpen(false);
        onShutdown();
    };

    return (
        <div className="taskbar" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35px',
            backgroundColor: 'var(--win-gray)',
            borderTop: '2px solid var(--win-white)',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            zIndex: 9999
        }}>
            {isStartOpen && (
                <div ref={startMenuRef}>
                    <StartMenu onLaunch={handleLaunch} onClose={() => setIsStartOpen(false)} onShutdown={handleShutdown} />
                </div>
            )}

            <button
                ref={startButtonRef}
                className={`win98-btn ${isStartOpen ? 'active' : ''}`}
                onClick={() => setIsStartOpen(!isStartOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 'bold',
                    marginRight: '10px',
                    height: '28px'
                }}
            >
                <div style={{ background: '#000', color: 'lime', padding: '0 2px', fontSize: '10px' }}>W98</div>
                Start
            </button>

            <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
                {windows.map((win) => (
                    <button
                        key={win.id}
                        id={`taskbar-btn-${win.id}`}
                        className={`win98-btn ${activeWindowId === win.id && !win.isMinimized ? 'active' : ''}`}
                        onClick={() => onRestore(win.id)}
                        style={{
                            height: '28px',
                            minWidth: '120px',
                            maxWidth: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'flex-start',
                            paddingLeft: '6px',
                            backgroundColor: activeWindowId === win.id && !win.isMinimized ? '#e0e0e0' : 'var(--win-gray)',
                            boxShadow: activeWindowId === win.id && !win.isMinimized ? 'var(--border-inset)' : 'var(--border-outset)',
                            fontWeight: activeWindowId === win.id && !win.isMinimized ? 'bold' : 'normal',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        <Monitor size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
                    </button>
                ))}
            </div>

            <div
                className="system-tray"
                style={{
                    boxShadow: 'var(--border-inset)',
                    padding: '2px 8px',
                    marginLeft: 'auto',
                    marginRight: '2px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};
