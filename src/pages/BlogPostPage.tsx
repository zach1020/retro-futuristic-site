import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { posts } from '../data/blogPosts';

export const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const post = posts.find(p => p.id === Number(id));

    if (!post) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fffdf9',
                color: '#000',
                fontFamily: 'monospace'
            }}>
                <h1>404 - Post Not Found</h1>
                <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return to Desktop</Link>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            overflowY: 'auto',
            backgroundColor: '#fffdf9',
            color: '#000',
            fontFamily: 'Times New Roman, serif',
            padding: '40px 20px',
            boxSizing: 'border-box'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '40px',
                    color: '#666',
                    textDecoration: 'none',
                    fontFamily: 'Chicago, Geneva, sans-serif',
                    fontSize: '14px'
                }}>
                    <ArrowLeft size={16} /> Back to Desktop
                </Link>

                <article>
                    <h1 style={{
                        fontSize: '36px',
                        marginBottom: '10px',
                        fontFamily: 'Arial, Helvetica, sans-serif'
                    }}>
                        {post.title}
                    </h1>
                    <div style={{
                        fontSize: '16px',
                        color: '#666',
                        marginBottom: '40px',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '20px'
                    }}>
                        {post.date}
                    </div>

                    <div className="markdown-content" style={{ lineHeight: '1.8', fontSize: '18px' }}>
                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '20px', borderBottom: '1px solid #ddd' }} {...props} />,
                                p: ({ node, ...props }) => <p style={{ marginBottom: '24px' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginBottom: '24px' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '8px' }} {...props} />,
                                code: ({ node, ...props }) => {
                                    const isInline = !props.className && String(props.children).indexOf('\n') === -1;
                                    return isInline
                                        ? <code style={{ backgroundColor: '#eee', padding: '2px 4px', fontFamily: 'monospace', fontSize: '0.9em' }} {...props} />
                                        : <code style={{ display: 'block', backgroundColor: '#f5f5f5', padding: '20px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: '20px 0', borderRadius: '4px', border: '1px solid #ddd' }} {...props} />;
                                },
                                pre: ({ node, ...props }) => <pre style={{ margin: 0 }} {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '4px solid #ccc', margin: '20px 0', paddingLeft: '16px', color: '#666', fontStyle: 'italic' }} {...props} />,
                                a: ({ node, ...props }) => <a style={{ color: 'blue', textDecoration: 'underline' }} {...props} />
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </article>

                <div style={{ marginTop: '80px', borderTop: '1px solid #ddd', paddingTop: '40px', textAlign: 'center' }}>
                    <Link to="/" style={{
                        padding: '10px 20px',
                        backgroundColor: '#000',
                        color: '#fff',
                        textDecoration: 'none',
                        fontFamily: 'Chicago, Geneva, sans-serif',
                        borderRadius: '4px'
                    }}>
                        Return to Desktop
                    </Link>
                </div>
            </div>
        </div>
    );
};
