import React from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../data/blogPosts';

export const BlogApp: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'inherit'
        }}>
            <div style={{
                backgroundColor: '#e0e0e0',
                borderBottom: '1px solid currentColor',
                color: '#000', // Keep chrome text black for contrast against gray chrome
                padding: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'Chicago, Geneva, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span>Netscape Blog Reader 1.0</span>
            </div>

            <div className="retro-scrollbar" style={{
                padding: '20px',
                overflowY: 'scroll',
                flex: 1,
                fontFamily: 'Times New Roman, serif',
                lineHeight: '1.6',
                userSelect: 'text',
                cursor: 'text'
            }}>
                {/* Menu View */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {posts.map(post => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/blog/${post.id}`)}
                            style={{
                                border: '1px solid currentColor',
                                padding: '10px',
                                cursor: 'pointer',
                                backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent
                                boxShadow: '2px 2px 0 currentColor',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--win-title-bg)';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'inherit';
                            }}
                        >
                            <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>{post.date}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};
