import React from 'react';

export const PodskipBanner: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) {
        return (
            <div
                onClick={() => setIsVisible(true)}
                style={{
                    position: 'absolute',
                    bottom: '48px',
                    right: '10px',
                    backgroundColor: '#FF00FF',
                    color: '#FFFF00',
                    border: '2px solid #00FFFF',
                    padding: '2px 8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    cursor: 'pointer',
                    zIndex: 9999,
                    boxShadow: '2px 2px 0px #000',
                    fontWeight: 'bold'
                }}
            >
                SHOW PROMO
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#FF00FF',
            color: '#FFFF00',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '5px 0',
            borderTop: '2px solid #00FFFF',
            borderBottom: '2px solid #00FFFF',
            position: 'absolute',
            bottom: '48px', // Position right above the taskbar (approx height)
            left: 0,
            zIndex: 9999, // Ensure it's above other elements but below windows if needed (windows are usually high z-index)
            // Actually windows are usually constrained or manage their own z-index. 
            // We want this to be "on screen" like the taskbar.
            textShadow: '1px 1px 0 #000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
                <a href="https://podskip.lol" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <span className="blink">{">>>"}</span> NEW PRODUCT ALERT: podskip.lol - uses AI to skip podcast ads, FTW!!! <span className="blink">{"<<<"}</span>
                </a>
            </div>

            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'transparent',
                    border: '1px solid #FFFF00',
                    color: '#FFFF00',
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
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .blink {
                    animation: blink 1s infinite;
                }
            `}</style>
        </div>
    );
};
