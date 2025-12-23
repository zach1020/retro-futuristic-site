import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimeContextType {
    time: Date;
    setTime: (time: Date) => void;
    isSystemTime: boolean;
    setIsSystemTime: (isSystem: boolean) => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [time, setTime] = useState(new Date());
    const [isSystemTime, setIsSystemTime] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSystemTime) {
            // Update immediately to sync
            setTime(new Date());

            interval = setInterval(() => {
                setTime(new Date());
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSystemTime]);

    return (
        <TimeContext.Provider value={{ time, setTime, isSystemTime, setIsSystemTime }}>
            {children}
        </TimeContext.Provider>
    );
};

export const useTime = () => {
    const context = useContext(TimeContext);
    if (context === undefined) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};
