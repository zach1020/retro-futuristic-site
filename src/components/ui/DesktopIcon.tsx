import React from 'react';

interface DesktopIconProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ label, icon, onClick }) => {
    return (
        <div
            className="desktop-icon"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '80px',
                cursor: 'pointer',
                color: 'black',
                textShadow: 'none',
                marginBottom: '16px',
                padding: '4px'
            }}
        >
            <div style={{ marginBottom: '4px' }}>
                {icon}
            </div>
            <span style={{ fontSize: '14px', textAlign: 'center', backgroundColor: 'transparent' }}>
                {label}
            </span>
            <style>{`
        .desktop-icon:active span {
            background-color: var(--win-blue);
            outline: 1px dotted yellow;
        }
      `}</style>
        </div>
    );
};
