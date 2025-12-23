import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface WindowState {
    id: string;
    title: string;
    content: ReactNode;
    isMinimized: boolean;
    zIndex: number;
    initialPosition?: { x: number; y: number };
    initialSize?: { width: number; height: number };
}

interface WindowManagerContextType {
    windows: WindowState[];
    activeWindowId: string | null;
    openWindow: (id: string, title: string, content: ReactNode, initialPosition?: { x: number; y: number }, initialSize?: { width: number; height: number }) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    focusWindow: (id: string) => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export const useWindowManager = () => {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error('useWindowManager must be used within a WindowManagerProvider');
    }
    return context;
};

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [highestZIndex, setHighestZIndex] = useState(1);

    const openWindow = (id: string, title: string, content: ReactNode, initialPosition?: { x: number; y: number }, initialSize?: { width: number; height: number }) => {
        setWindows((prev) => {
            const existing = prev.find((w) => w.id === id);
            if (existing) {
                // If already open, just focus and restore it
                return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w);
            }
            return [...prev, { id, title, content, isMinimized: false, zIndex: highestZIndex + 1, initialPosition, initialSize }];
        });
        setHighestZIndex(h => h + 1);
        setActiveWindowId(id);
    };

    const closeWindow = (id: string) => {
        setWindows((prev) => prev.filter((w) => w.id !== id));
        if (activeWindowId === id) {
            setActiveWindowId(null);
        }
    };

    const minimizeWindow = (id: string) => {
        setWindows((prev) => prev.map((w) => w.id === id ? { ...w, isMinimized: true } : w));
        if (activeWindowId === id) {
            setActiveWindowId(null);
        }
    };

    const restoreWindow = (id: string) => {
        setWindows((prev) => prev.map((w) => w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w));
        setHighestZIndex(h => h + 1);
        setActiveWindowId(id);
    }

    const focusWindow = (id: string) => {
        setWindows((prev) => {
            const win = prev.find(w => w.id === id);
            if (!win || win.zIndex === highestZIndex) return prev; // Already top
            return prev.map(w => w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w);
        });
        setHighestZIndex(h => h + 1);
        setActiveWindowId(id);
    };

    return (
        <WindowManagerContext.Provider value={{
            windows,
            activeWindowId,
            openWindow,
            closeWindow,
            minimizeWindow,
            restoreWindow,
            focusWindow
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
};
