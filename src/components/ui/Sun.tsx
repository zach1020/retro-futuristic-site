import React, { useState, useEffect } from 'react';
import { useTime } from '../../context/TimeContext';

export const Sun: React.FC = () => {
    const { time } = useTime();
    const [position, setPosition] = useState({ x: 0, y: 100 }); // y=100 is below horizon
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // Sunrise at 6:00 (360 min), Sunset at 18:00 (1080 min)
            const sunriseTime = 6 * 60;
            const sunsetTime = 18 * 60;

            if (totalMinutes >= sunriseTime && totalMinutes <= sunsetTime) {
                setIsVisible(true);
                const dayDuration = sunsetTime - sunriseTime;
                const elapsed = totalMinutes - sunriseTime;
                const percentage = elapsed / dayDuration;

                // X position: 0% to 100% of viewport width
                const x = percentage * 100;

                // Y position: Parabola (Sine approximation)
                // Peak (0% top) at 50% progress (noon)
                // Horizon (100% bottom) at 0% and 100% progress
                // Formula: y = 4 * (p - 0.5)^2 * 100? No, let's keep it simple.
                // Sin wave: sin(0) = 0, sin(PI) = 0, sin(PI/2) = 1
                // We want 0 at edges, 1 at peak.
                // Y = 100 - (sin(p * PI) * 80) -> 20% from top at peak, 100% at edges

                const y = 100 - (Math.sin(percentage * Math.PI) * 90);
                // Peak at 10vh (high in sky), Sets at 100vh (horizon)

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
                left: `calc(${position.x}% - 175px)`, // Center horizontally (half of 350px)
                top: `${position.y}%`,
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #ffd700, #ff8c00, #ff4500)', // Juicier gradient
                boxShadow: '0 0 60px rgba(255, 215, 0, 0.8)', // Bigger glow
                zIndex: 1, // Behind icons
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
