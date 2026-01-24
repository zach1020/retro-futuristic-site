import React from 'react';

export const BioApp: React.FC = () => {
    return (
        <div style={{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                backgroundColor: '#fff',
                border: '2px solid #808080',
                padding: '10px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #000',
                    overflow: 'hidden'
                }}>
                    <img src="https://github.com/zach1020.png" alt="Zach" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>Zach</h2>
                    <p style={{ margin: 0, fontSize: '14px' }}>Programming Generalist & AI Expert</p>
                </div>
            </div>

            <div style={{
                flex: 1,
                backgroundColor: '#fff',
                border: '2px inset #dfdfdf',
                padding: '10px',
                overflowY: 'auto',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '14px',
                lineHeight: '1.5'
            }}>
                <div style={{ marginBottom: '15px', textAlign: 'center', borderBottom: '1px dashed #999', paddingBottom: '10px' }}>
                    <a href="/UpdatedResumeZachBohl2026.docx.pdf" download style={{ color: '#0000AA', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
                        [Download Resume]
                    </a>
                </div>
                <p><strong>Role:</strong> Generalist / Maker / Researcher</p>
                <p><strong>Specialties:</strong> Low-level, Full-stack, Cybersecurity, AI</p>
                <p><strong>Education:</strong> MS Computer Science</p>
                <hr style={{ borderTop: '1px dotted #000', margin: '10px 0' }} />

                <p style={{ marginBottom: '10px' }}>
                    I am a passionate <strong>Programming Generalist</strong> who thrives in the deep end of the stack.
                    Whether it's writing low-level code, architecting full-stack applications, or securing systems in cybersecurity,
                    I love jumping through hoops to master any technology.
                </p>

                <p style={{ marginBottom: '10px' }}>
                    I hold a graduate degree in <strong>Computer Science</strong> and pride myself on being a self-starter
                    with an unyieldling passion for researching and building things. As an early adopter and expert in <strong>AI</strong>,
                    I am constantly exploring the bleeding edge of what's possible.
                </p>

                <p style={{ marginBottom: '10px' }}>
                    When I'm not coding, I make music and DJ under the moniker <strong>Capybara Watanabe</strong>.
                </p>

                <div style={{ marginTop: '15px', marginBottom: '15px', textAlign: 'center', borderTop: '1px dashed #999', paddingTop: '10px' }}>
                    <a href="/UpdatedResumeZachBohl2026.docx.pdf" download style={{ color: '#0000AA', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
                        [Download Resume]
                    </a>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button className="win98-btn" onClick={() => window.open('mailto:bohl.zachary@gmail.com')}>Contact Me</button>
                    <button className="win98-btn" style={{ marginLeft: '10px' }} onClick={() => window.open('https://github.com/zach1020', '_blank')}>GitHub</button>
                </div>
            </div>
        </div>
    );
};
