import React, { useState, useEffect } from 'react';
import { useTime } from '../../context/TimeContext';

export const Moon: React.FC = () => {
    const { time } = useTime();
    const [position, setPosition] = useState({ x: 0, y: 100 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // Moon Rise at 18:00 (Sunset), Set at 06:00 (Sunrise)
            // Duration: 12 hours (720 minutes)
            const riseTime = 18 * 60; // 1080
            const setTime = 6 * 60;   // 360

            let elapsed = 0;
            let isNight = false;

            if (totalMinutes >= riseTime) {
                // Evening (18:00 - 23:59)
                isNight = true;
                elapsed = totalMinutes - riseTime;
            } else if (totalMinutes < setTime) {
                // Morning (00:00 - 06:00)
                isNight = true;
                elapsed = totalMinutes + (24 * 60) - riseTime; // Add 24h to wrap around
            }

            if (isNight) {
                setIsVisible(true);
                const nightDuration = 12 * 60; // 720
                const percentage = elapsed / nightDuration;

                // X position: 0% to 100%
                const x = percentage * 100;

                // Y position: Arc
                const y = 100 - (Math.sin(percentage * Math.PI) * 90);

                setPosition({ x, y });
            } else {
                setIsVisible(false);
            }
        };

        updatePosition();
    }, [time]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `calc(${position.x}% - 60px)`, // 120px width
                top: `${position.y}%`,
                width: '120px', // Bigger
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #f4f4f4, #cfcfcf)', // Subtler
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)', // Reduced glow
                zIndex: 1,
                opacity: 0.9, // Slightly transparent
                pointerEvents: 'none',
                transition: 'top 1s linear, left 1s linear',
                // Stippled mask
                maskImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                maskSize: '4px 4px',
                maskPosition: '0 0, 2px 2px',
                WebkitMaskImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                WebkitMaskSize: '4px 4px',
                WebkitMaskPosition: '0 0, 2px 2px',
            }}
        />
    );
};
