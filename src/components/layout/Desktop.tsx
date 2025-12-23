import React from 'react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { Window } from '../ui/Window';
import { Taskbar } from '../ui/Taskbar';
import { DesktopIcon } from '../ui/DesktopIcon';
import { User, Briefcase, Music, BookOpen, Settings, Brush } from 'lucide-react';
import { BioApp } from '../../apps/BioApp';
import { ProjectsApp } from '../../apps/ProjectsApp';
import { MusicApp } from '../../apps/MusicApp';
import { BlogApp } from '../../apps/BlogApp';
import { SystemInfoApp } from '../../apps/SystemInfoApp';
import { PaintApp } from '../../apps/PaintApp';
import { SettingsApp } from '../../apps/SettingsApp';
import { useTheme } from '../../context/ThemeContext';

import { useIsMobile } from '../../hooks/useIsMobile';

export const Desktop: React.FC = () => {
    const { windows, activeWindowId, openWindow, closeWindow, minimizeWindow, focusWindow, restoreWindow } = useWindowManager();
    const { currentBackground } = useTheme();
    const isMobile = useIsMobile();

    // Placeholder Apps
    const launchBio = () => {
        openWindow('bio', 'Bio.txt', (
            <BioApp />
        ), { x: 100, y: 50 }, { width: 500, height: 400 });
    };

    const launchProjects = () => {
        openWindow('projects', 'My Projects', (
            <ProjectsApp />
        ), { x: 150, y: 80 }, { width: 600, height: 500 });
    };

    const launchMusic = () => {
        openWindow('music', 'WinAmp 98', (
            <MusicApp />
        ), { x: 200, y: 110 }, { width: 350, height: 500 });
    };

    const launchBlog = () => {
        openWindow('blog', 'Netscape Blog', (
            <BlogApp />
        ), { x: 250, y: 140 }, { width: 600, height: 500 });
    };

    const launchSettings = () => {
        openWindow('settings', 'Control Panel', (
            <SettingsApp />
        ), { x: 300, y: 170 }, { width: 400, height: 350 });
    };

    const launchSystemInfo = () => {
        openWindow('sysinfo', ':: SYSTEM INFO ::', <SystemInfoApp />, { x: 150, y: 150 }, { width: 400, height: 500 });
    };

    const launchPaint = () => {
        openWindow('paint', ':: COMMUNITY PAINT ::', <PaintApp />, { x: 50, y: 50 }, { width: 820, height: 700 });
    };

    // Start Menu Handlers
    const [isShutdown, setIsShutdown] = React.useState(false);

    const handleLaunchApp = (appId: string) => {
        switch (appId) {
            case 'bio': launchBio(); break;
            case 'projects': launchProjects(); break;
            case 'music': launchMusic(); break;
            case 'blog': launchBlog(); break;
            case 'settings': launchSettings(); break;
            case 'sysinfo': launchSystemInfo(); break;
            case 'paint': launchPaint(); break;
            default: console.warn('Unknown app:', appId);
        }
    };

    // Auto-launch Music App
    React.useEffect(() => {
        launchMusic();
    }, []);

    if (isShutdown) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: '#000', zIndex: 99999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'lime', fontFamily: 'monospace'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>SYSTEM HALTED</div>
                <div style={{ fontSize: '16px', opacity: 0.7 }}>It is now safe to turn off your computer.</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '40px',
                        background: 'transparent',
                        border: '1px solid lime',
                        color: 'lime',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                    }}
                >
                    REBOOT_SYSTEM
                </button>
            </div>
        );
    }

    return (
        <div
            className="desktop"
            style={{
                width: '100vw',
                height: '100vh',
                background: currentBackground.value,
                backgroundColor: !currentBackground.value.includes('gradient') ? currentBackground.value : undefined,
                position: 'relative',
                overflow: 'hidden',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background 0.5s ease',
                ['--win-gray' as any]: currentBackground.windowTheme?.bg || '#fffdf9',
                ['--win-title-bg' as any]: currentBackground.windowTheme?.titleBar || '#fffdf9',
                ['--win-text' as any]: currentBackground.windowTheme?.textColor || '#000000',
            }}
        >
            {/* Palm Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(/palm-overlay.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: 'none',
                    opacity: 0.2, // Subtle overlay
                    zIndex: 0
                }}
            />

            {/* Desktop Icons Area */}
            <div
                style={{
                    position: 'absolute',
                    bottom: isMobile ? 'auto' : '60px',
                    top: isMobile ? '20px' : 'auto',
                    left: 0,
                    width: '100%',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: isMobile ? 'flex-start' : 'flex-end',
                    flexWrap: 'wrap',
                    gap: isMobile ? '16px' : '30px',
                    pointerEvents: 'none'
                }}
            >
                <div style={{ pointerEvents: 'auto', display: 'flex', gap: isMobile ? '16px' : '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <DesktopIcon label="My Computer" icon={<User size={32} />} onClick={launchBio} />
                    <DesktopIcon label="Projects" icon={<Briefcase size={32} />} onClick={launchProjects} />
                    <DesktopIcon label="Music" icon={<Music size={32} />} onClick={launchMusic} />
                    <DesktopIcon label="Internet Blog" icon={<BookOpen size={32} />} onClick={launchBlog} />
                    <DesktopIcon label="Community Paint" icon={<Brush size={32} />} onClick={launchPaint} />
                    <DesktopIcon label="Settings" icon={<Settings size={32} />} onClick={launchSettings} />
                </div>
            </div>

            {/* Windows Layer */}
            {windows.map((win) => (
                <Window
                    key={win.id}
                    id={win.id}
                    title={win.title}
                    isActive={activeWindowId === win.id}
                    isMinimized={win.isMinimized}
                    zIndex={win.zIndex}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => minimizeWindow(win.id)}
                    onFocus={() => focusWindow(win.id)}
                    initialPosition={win.initialPosition}
                    initialSize={win.initialSize}
                >
                    {win.content}
                </Window>
            ))}

            {/* Taskbar */}
            <Taskbar
                windows={windows}
                activeWindowId={activeWindowId}
                onRestore={restoreWindow}
                onLaunchApp={handleLaunchApp}
                onShutdown={() => setIsShutdown(true)}
            />
        </div>
    );
};
