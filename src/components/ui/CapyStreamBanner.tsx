import React from 'react';

export const CapyStreamBanner: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) {
        return (
            <div
                onClick={() => setIsVisible(true)}
                style={{
                    position: 'absolute',
                    bottom: '78px',
                    right: '10px',
                    backgroundColor: '#00FFFF',
                    color: '#FF00FF',
                    border: '2px solid #00FF00',
                    padding: '2px 8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    cursor: 'pointer',
                    zIndex: 9999,
                    boxShadow: '2px 2px 0px #000',
                    fontWeight: 'bold'
                }}
            >
                SHOW STREAM
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#00FFFF',
            color: '#FF00FF',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '5px 0',
            borderTop: '2px solid #00FF00',
            borderBottom: '2px solid #00FF00',
            position: 'absolute',
            bottom: '78px', // Position above the PodskipBanner
            left: 0,
            zIndex: 9999,
            textShadow: '0 0 10px #FF00FF, 1px 1px 0 #000',
            boxShadow: '0 0 20px #00FFFF, 0 0 30px #00FFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
                <a href="https://capystream.lol" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <span className="blink-capy">{"★★★"}</span> NEW EXCITING PERSONAL STREAMING SERVICE: capystream.lol - Your content, your way! <span className="blink-capy">{"★★★"}</span>
                </a>
            </div>

            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'transparent',
                    border: '1px solid #FF00FF',
                    color: '#FF00FF',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginRight: '10px',
                    padding: '0 5px',
                    position: 'absolute',
                    right: '10px'
                }}
            >
                [X]
            </button>

            <style>{`
                @keyframes blink-capy {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .blink-capy {
                    animation: blink-capy 1.5s infinite;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
};
