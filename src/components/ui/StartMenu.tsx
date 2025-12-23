import React, { useState, useEffect } from 'react';
import { User, Briefcase, Music, BookOpen, Zap, Power, Activity, Info, Brush } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StartMenuProps {
    onLaunch: (appId: string) => void;
    onClose: () => void;
    onShutdown: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onLaunch, onShutdown }) => {
    const { nextBackground } = useTheme();
    const [randomHex, setRandomHex] = useState('0x0000');

    // Matrix rain / hex glitch effect
    useEffect(() => {
        const interval = setInterval(() => {
            setRandomHex(`0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')} `);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const menuStyle = {
        position: 'absolute' as const,
        bottom: '40px',
        left: '0px',
        width: '300px',
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        border: '1px solid var(--win-title-bg)',
        boxShadow: '0 0 15px var(--win-title-bg)',
        backdropFilter: 'blur(10px)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
        zIndex: 10000,
        color: '#fff',
        animation: 'slideUp 0.2s ease-out'
    };

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background 0.2s',
        color: '#fff',
        textDecoration: 'none',
        border: '1px solid transparent',
    };

    const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderColor = 'var(--win-title-bg)';
    };

    const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
    };

    return (
        <div style={menuStyle}>
            {/* Header */}
            <div style={{
                background: 'var(--win-title-bg)',
                padding: '5px 10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>CYBER_DECK_V1</span>
                <Activity size={14} />
            </div>

            {/* User Info / System Stats */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{
                    width: '40px', height: '40px', background: '#000', border: '1px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <img src="https://github.com/zach1020.png" style={{ width: '100%' }} alt="Avatar" />
                </div>
                <div>
                    <div style={{ fontWeight: 'bold' }}>USER: ZACH</div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'lime' }}>
                        MEM: {randomHex} | CPU: 12%
                    </div>
                </div>
            </div>

            {/* Quick Launch Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '5px' }}>APPLICATIONS</div>

                <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('bio')}>
                    <User size={18} /> BIO
                </div>
                <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('projects')}>
                    <Briefcase size={18} /> PROJECTS
                </div>
                <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('music')}>
                    <Music size={18} /> MUSIC
                </div>
                <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('blog')}>
                    <BookOpen size={18} /> BLOG
                </div>
                <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('paint')}>
                    <Brush size={18} /> COMMUNITY_PAINT
                </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '5px 0' }} />

            {/* System Actions */}
            <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={() => onLaunch('sysinfo')}>
                <Info size={18} /> SYSTEM_INFO
            </div>

            <div style={itemStyle} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={nextBackground}>
                <Zap size={18} color="gold" /> THEME_CYCLE
            </div>

            <div style={{ ...itemStyle, color: '#ff4444' }} onMouseEnter={handleHover} onMouseLeave={handleLeave} onClick={onShutdown}>
                <Power size={18} /> SYSTEM_HALT
            </div>
        </div>
    );
};
