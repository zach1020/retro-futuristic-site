import React from 'react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { Window } from '../ui/Window';
import { Taskbar } from '../ui/Taskbar';
import { DesktopIcon } from '../ui/DesktopIcon';
import { Sun } from '../ui/Sun';
import { Moon } from '../ui/Moon';
import { User, Briefcase, Music, BookOpen, Settings, Brush } from 'lucide-react';
import { PodskipBanner } from '../ui/PodskipBanner';
import { BioApp } from '../../apps/BioApp';
import { ProjectsApp } from '../../apps/ProjectsApp';
import { MusicApp } from '../../apps/MusicApp';
import { BlogApp } from '../../apps/BlogApp';
import { SystemInfoApp } from '../../apps/SystemInfoApp';
import { PaintApp } from '../../apps/PaintApp';
import { SettingsApp } from '../../apps/SettingsApp';
import { CapyNotezApp } from '../../apps/CapyNotezApp';
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
        ), { x: 200, y: 110 }, { width: 480, height: 320 });
    };

    const launchBlog = () => {
        openWindow('blog', 'Netscape Blog', (
            <BlogApp />
        ), { x: 250, y: 140 }, { width: 600, height: 500 });
    };

    const launchSettings = () => {
        openWindow('settings', 'Control Panel', (
            <SettingsApp />
        ), { x: 300, y: 170 }, { width: 500, height: 550 });
    };

    const launchSystemInfo = () => {
        openWindow('sysinfo', ':: SYSTEM INFO ::', <SystemInfoApp />, { x: 150, y: 150 }, { width: 400, height: 500 });
    };

    const launchPaint = () => {
        openWindow('paint', ':: COMMUNITY PAINT ::', <PaintApp />, { x: 50, y: 50 }, { width: 820, height: 700 });
    };

    const launchCapyNotez = () => {
        if (isMobile) return;
        openWindow('capynotez', 'CapyNotezzZ', <CapyNotezApp />, { x: 350, y: 200 }, { width: 450, height: 400 });
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
            case 'capynotez': launchCapyNotez(); break;
            default: console.warn('Unknown app:', appId);
        }
    };

    // Auto-launch Music App
    React.useEffect(() => {
        if (!isMobile) {
            launchMusic();
        }
    }, [isMobile]);

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

    // Selection Box State
    const [selectionBox, setSelectionBox] = React.useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start selection if clicking directly on the desktop or pseudo-elements
        // We allow clicking on the "root" desktop div or the background layers
        if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'desktop-background') {
            setSelectionBox({
                startX: e.clientX,
                startY: e.clientY,
                currentX: e.clientX,
                currentY: e.clientY
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (selectionBox) {
            setSelectionBox(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
        }
    };

    const handleMouseUp = () => {
        setSelectionBox(null);
    };

    // Calculate selection box dimensions
    const getSelectionBoxStyle = () => {
        if (!selectionBox) return {};
        const { startX, startY, currentX, currentY } = selectionBox;
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        // Use theme colors
        const borderColor = currentBackground.windowTheme?.titleBar || 'rgba(255, 255, 255, 0.7)';
        // Use color-mix to add transparency to the theme color for the background
        const backgroundColor = currentBackground.windowTheme?.titleBar
            ? `color-mix(in srgb, ${currentBackground.windowTheme.titleBar} 30%, transparent)`
            : 'rgba(0, 120, 215, 0.3)';

        return {
            left,
            top,
            width,
            height,
            position: 'absolute' as const,
            border: `1px dotted ${borderColor}`,
            backgroundColor,
            pointerEvents: 'none' as const,
            zIndex: 10 // Above icons, below windows
        };
    };

    return (
        <div
            className="desktop"
            id="desktop-background"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
            {/* Sky / Sun Layer - Clipped by "ground" (desktop icons area) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                // Actually, user wants it cut off by the "horizontal line drawn by the icons"
                // Let's assume the icons start around bottom 100px.
                // We'll make this container full height but handle z-index carefully?
                // Or just use overflow hidden on a top section.
                // Let's adjust height to be "Sky" height.
                height: '77.5%',
                overflow: 'hidden',
                pointerEvents: 'none',
                // ... (in render)
                zIndex: 0
            }}>
                <Sun />
                <Moon />
            </div>

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

            {/* Retro Effects */}
            <div className="retro-sparkles" />
            <div className="retro-scanlines" />

            {/* Selection Box */}
            {selectionBox && <div style={getSelectionBoxStyle()} />}

            {/* Hidden/Easter Egg Icons */}
            {!isMobile && (
                <div style={{ position: 'absolute', top: '150px', left: '230px', zIndex: 1 }}>
                    <DesktopIcon label="CapyNotezzZ" icon={<img src="/capy-icon-bw.png" alt="Capy" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />} onClick={launchCapyNotez} isOpen={windows.some(w => w.id === 'capynotez')} />
                </div>
            )}

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
                    <DesktopIcon label="My Computer" icon={<User size={32} />} onClick={launchBio} isOpen={windows.some(w => w.id === 'bio')} />
                    <DesktopIcon label="Projects" icon={<Briefcase size={32} />} onClick={launchProjects} isOpen={windows.some(w => w.id === 'projects')} />
                    <DesktopIcon label="Music" icon={<Music size={32} />} onClick={launchMusic} isOpen={windows.some(w => w.id === 'music')} />
                    <DesktopIcon label="Internet Blog" icon={<BookOpen size={32} />} onClick={launchBlog} isOpen={windows.some(w => w.id === 'blog')} />
                    <DesktopIcon label="Community Paint" icon={<Brush size={32} />} onClick={launchPaint} isOpen={windows.some(w => w.id === 'paint')} />
                    <DesktopIcon label="Settings" icon={<Settings size={32} />} onClick={launchSettings} isOpen={windows.some(w => w.id === 'settings')} />
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

            {/* Promotional Banner */}
            <PodskipBanner />

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
