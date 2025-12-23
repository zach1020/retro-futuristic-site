import React from 'react';

export const CapyNotezApp: React.FC = () => {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '14px',
        }}>
            {/* Menu Bar (Visual only) */}
            <div style={{
                display: 'flex',
                gap: '12px',
                padding: '4px 8px',
                borderBottom: '1px solid #808080',
                backgroundColor: '#c0c0c0',
                fontSize: '12px',
                userSelect: 'none'
            }}>
                <span>File</span>
                <span>Edit</span>
                <span>Search</span>
                <span>Help</span>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                outline: 'none'
            }} contentEditable suppressContentEditableWarning>
                Fun LinkzzZ:
                <br />
                <br />
                1. Capy's amazing playlist organizer: <a href="https://www.capys-amazing-playlist-organizer.com/" target="_blank" rel="noreferrer" contentEditable={false} style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>https://www.capys-amazing-playlist-organizer.com/</a>
                <br />
                2. Rust dev find job: <a href="https://www.rustdevfindjob.com/" target="_blank" rel="noreferrer" contentEditable={false} style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>https://www.rustdevfindjob.com/</a>
                <br />
                3. Falling sand game: <a href="https://github.com/zach1020/falling-sand" target="_blank" rel="noreferrer" contentEditable={false} style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>https://github.com/zach1020/falling-sand</a>
                <br />
                4. Sasquatch game (WIP): <a href="https://github.com/zach1020/sasquatch" target="_blank" rel="noreferrer" contentEditable={false} style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>https://github.com/zach1020/sasquatch</a>
                <br />
                <br />
                --Capy
                <br />
                <br />
                P.S. be sure to check out the homie Frumperoni on Twitch! He tolerates the crazy ideas I get and my 4am inspiration strikings. Yuppppp, join the Fellowship of the Frump! <a href="https://www.twitch.tv/frumperoni" target="_blank" rel="noreferrer" contentEditable={false} style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>https://www.twitch.tv/frumperoni</a>
                <br />
                <br />
                SMELL yeah!
            </div>

            {/* Status Bar */}
            <div style={{
                borderTop: '1px solid #808080',
                backgroundColor: '#c0c0c0',
                padding: '2px 8px',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'flex-end',
                userSelect: 'none'
            }}>
                Ln 9, Col 7
            </div>
        </div>
    );
};
