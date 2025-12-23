import React from 'react';
import { useTheme, backgroundPresets } from '../context/ThemeContext';

export const SettingsApp: React.FC = () => {
    const { currentBackground, setBackground } = useTheme();

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
        </div>
    );
};
