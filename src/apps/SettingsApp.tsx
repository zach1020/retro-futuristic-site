import React from 'react';
import { useTheme, backgroundPresets } from '../context/ThemeContext';
import { useTime } from '../context/TimeContext';

export const SettingsApp: React.FC = () => {
    const { currentBackground, setBackground } = useTheme();
    const { time, setTime, isSystemTime, setIsSystemTime } = useTime();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px',
            color: '#fff',
            fontFamily: '"MS Sans Serif", sans-serif'
        }}>
            <div>
                <h2 style={{
                    margin: '0 0 15px 0',
                    fontSize: '18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingBottom: '10px'
                }}>
                    Desktop Appearance
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '15px'
                }}>
                    {backgroundPresets.map((preset) => (
                        <div
                            key={preset.id}
                            onClick={() => setBackground(preset)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/10',
                                background: preset.thumbnail?.includes('gradient') ? preset.thumbnail : preset.thumbnail,
                                backgroundColor: !preset.thumbnail?.includes('gradient') ? preset.thumbnail : undefined,
                                border: currentBackground.id === preset.id
                                    ? '2px solid #00ff00'
                                    : '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: currentBackground.id === preset.id
                                    ? '0 0 10px rgba(0, 255, 0, 0.5)'
                                    : 'none',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease'
                            }} />
                            <span style={{
                                fontSize: '12px',
                                textAlign: 'center',
                                opacity: currentBackground.id === preset.id ? 1 : 0.7
                            }}>
                                {preset.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>      {/* Date & Time Settings */}
            <div>
                <h2 style={{
                    margin: '0 0 15px 0',
                    fontSize: '18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingBottom: '10px'
                }}>
                    Date & Time
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isSystemTime}
                            onChange={(e) => setIsSystemTime(e.target.checked)}
                        />
                        Use System Time
                    </label>

                    {!isSystemTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Time:</span>
                            <input
                                type="range"
                                min="0"
                                max="1439" // 24 * 60 - 1
                                value={time.getHours() * 60 + time.getMinutes()}
                                onChange={(e) => {
                                    const minutes = parseInt(e.target.value);
                                    const newDate = new Date(time);
                                    newDate.setHours(Math.floor(minutes / 60));
                                    newDate.setMinutes(minutes % 60);
                                    setTime(newDate);
                                }}
                                style={{ flex: 1 }}
                            />
                            <span style={{ minWidth: '50px', textAlign: 'right' }}>
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: 'auto',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center',
                opacity: 0.7
            }}>
                More customization options coming soon...
            </div>
        </div >
    );
};
