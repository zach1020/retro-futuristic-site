import React from 'react';

const projects = [
    { id: 6, title: 'RustybaraOS', desc: 'UNIX-like OS kernel in Rust', lang: 'Rust', url: 'https://github.com/zach1020/RustybaraOS' },
    { id: 8, title: 'Slab Allocator', desc: 'O(1) GlobalAlloc slab allocator', lang: 'Rust', url: 'https://github.com/zach1020/RustybaraOS' },
    { id: 4, title: 'Chip-8-Emulator', desc: 'Full Chip-8 virtual machine', lang: 'C++', url: 'https://github.com/zach1020/Chip-8-Emulator' },
    { id: 7, title: 'ZPT2', desc: 'GPT-2 transformer from scratch', lang: 'TypeScript', url: 'https://github.com/zach1020/ZPT2' },
    { id: 9, title: 'PodSkip', desc: 'AI podcast ad-detection', lang: 'Python', url: 'https://podskip.lol' },
    { id: 5, title: 'veryrandom', desc: 'Quantum RNG with Qiskit', lang: 'Python', url: 'https://github.com/zach1020/veryrandom' },
    { id: 2, title: 'Orthogonal-Bloch', desc: 'Quantum states visualization', lang: 'Python', url: 'https://github.com/zach1020/Orthogonal-Bloch' },
    { id: 1, title: 'ai-journal', desc: 'AI-powered journaling app', lang: 'JavaScript', url: 'https://github.com/zach1020/ai-journal' },
];

export const ProjectsApp: React.FC = () => {
    const openProject = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '5px',
                borderBottom: '1px solid #808080',
                marginBottom: '5px',
                fontSize: '12px'
            }}>
                {projects.length} object(s)
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '15px',
                padding: '10px'
            }}>
                {projects.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => openProject(p.url)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '5px',
                            border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.border = '1px dotted #808080'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '1px solid transparent'}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#fff',
                            border: '1px solid #000',
                            marginBottom: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            boxShadow: '2px 2px 0px rgba(0,0,0,0.2)'
                        }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>REPO</span>
                            <div style={{
                                width: '100%',
                                height: '5px',
                                background: p.lang === 'Rust' ? '#dea584' : p.lang === 'Python' ? '#3572A5' : p.lang === 'C++' ? '#f34b7d' : p.lang === 'TypeScript' ? '#3178c6' : '#f1e05a',
                                position: 'absolute',
                                bottom: 0
                            }} />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{p.title}</div>
                        <div style={{ textAlign: 'center', fontSize: '10px', color: '#444' }}>{p.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
