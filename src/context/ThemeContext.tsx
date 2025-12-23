import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface BackgroundOption {
    id: string;
    name: string;
    value: string; // CSS background value
    thumbnail?: string; // Optional thumbnail color/gradient
    windowTheme?: {
        bg: string;
        titleBar: string;
        textColor?: string;
    };
}

export const backgroundPresets: BackgroundOption[] = [
    {
        id: 'default',
        name: 'Classic Teal',
        value: '#008080', // Windows 95 Teal
        thumbnail: 'teal',
        windowTheme: {
            bg: '#c0c0c0', // Windows 95 Gray
            titleBar: '#000080', // Active Blue
            textColor: '#000000'
        }
    },
    {
        id: 'vapor-sunset',
        name: 'Vapor Sunset',
        value: 'linear-gradient(to bottom, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        thumbnail: 'linear-gradient(to bottom, #ff9a9e, #fecfef)',
        windowTheme: {
            bg: '#ffe6ea', // Pinkish
            titleBar: '#ff69b4', // Hot Pink
            textColor: '#5d1c3a' // Dark Rose
        }
    },
    {
        id: 'neon-night',
        name: 'Neon Night',
        value: 'linear-gradient(135deg, #120c1f 0%, #302b63 50%, #24243e 100%)',
        thumbnail: 'linear-gradient(135deg, #120c1f, #302b63)',
        windowTheme: {
            bg: '#2a2a35', // Dark Gray-Blue
            titleBar: '#7d5fff', // Electric Purple
            textColor: '#ffffff'
        }
    },
    {
        id: 'cyber-grid',
        name: 'Cyber Grid',
        value: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
        thumbnail: '#2a2a2a',
        windowTheme: {
            bg: '#0a0a0a', // Almost Black
            titleBar: '#00ff41', // Matrix Green
            textColor: '#00ff41'
        }
    },
    {
        id: 'deep-space',
        name: 'Deep Space',
        value: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
        thumbnail: '#090a0f',
        windowTheme: {
            bg: '#16213e', // Dark Blue
            titleBar: '#e94560', // Red Accent
            textColor: '#ffffff'
        }
    },
    {
        id: 'retro-grid-pink',
        name: 'Retro Pink',
        value: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(236, 72, 153, 0.1) 1px, rgba(236, 72, 153, 0.1) 2px), repeating-linear-gradient(90deg, transparent 0px, transparent 1px, rgba(236, 72, 153, 0.1) 1px, rgba(236, 72, 153, 0.1) 2px), linear-gradient(to bottom, #2a0a2e, #000000)',
        thumbnail: '#2a0a2e',
        windowTheme: {
            bg: '#ffbcd9', // Light Pink
            titleBar: '#ff1493', // Deep Pink
            textColor: '#2a0a2e'
        }
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        value: 'linear-gradient(to bottom, #200122, #6f0000)',
        thumbnail: 'linear-gradient(to bottom, #200122, #6f0000)',
        windowTheme: {
            bg: '#2b002b', // Dark Purple
            titleBar: '#ff00ff', // Magenta
            textColor: '#00ffff' // Cyan
        }
    }
];

interface ThemeContextType {
    currentBackground: BackgroundOption;
    setBackground: (bg: BackgroundOption) => void;
    nextBackground: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentBackground, setBackground] = useState<BackgroundOption>(backgroundPresets[1]); // Vapor Sunset

    const nextBackground = () => {
        const currentIndex = backgroundPresets.findIndex(bg => bg.id === currentBackground.id);
        const nextIndex = (currentIndex + 1) % backgroundPresets.length;
        setBackground(backgroundPresets[nextIndex]);
    };

    return (
        <ThemeContext.Provider value={{ currentBackground, setBackground, nextBackground }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
