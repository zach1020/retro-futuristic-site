import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const COLORS = [
    '#000000', // Black
    '#ffffff', // White
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#00ff00', // Green
    '#ffff00', // Yellow
    '#ff0000', // Red
    '#0000ff', // Blue
    '#ff9900', // Orange
    '#9900ff', // Purple
];

// Connect to the local server
// In a real deployed environment, this URL would need to be dynamic or an env var.
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface DrawData {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    size: number;
}

export const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ff00ff');
    const [brushSize, setBrushSize] = useState(2);
    const [timeLeft, setTimeLeft] = useState('');
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    // Track previous coordinates for smooth lines
    const prevPos = useRef<{ x: number, y: number } | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Disclaimer Check
    useEffect(() => {
        const hasAgreed = localStorage.getItem('paint_disclaimer_agreed');
        if (hasAgreed) {
            setShowDisclaimer(false);
        }
    }, []);

    // Socket Connection
    useEffect(() => {
        socketRef.current = io(SERVER_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to Paint Server');
        });

        socketRef.current.on('load_history', (history: DrawData[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear first (in case of re-connect)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Replay history
            history.forEach(data => {
                drawLine(ctx, data.prevX, data.prevY, data.x, data.y, data.color, data.size);
            });
        });

        socketRef.current.on('draw_remote', (data: DrawData) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            drawLine(ctx, data.prevX, data.prevY, data.x, data.y, data.color, data.size);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const handleAgree = () => {
        localStorage.setItem('paint_disclaimer_agreed', 'true');
        setShowDisclaimer(false);
    };

    // Countdown Timer logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const diff = nextMonth.getTime() - now.getTime();

            if (diff <= 0) return "RESETTING...";

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, []);

    // Canvas Setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Canvas Size
        canvas.width = 800;
        canvas.height = 600;

        // Fill white background default
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Remove old localstorage usage here
    }, []);

    // Helper for actual drawing
    const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, strokeColor: string, size: number) => {
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    // Drawing Handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const pos = getPos(e);
        prevPos.current = pos;

        // Dot for single click?
        // Ideally we draw a dot locally and emit it. 
        // For simplicity, we'll wait for move, but to support dots we can emit a start/end same-point line.
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        prevPos.current = null;
    };

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const { x, y } = getPos(e);
        const prev = prevPos.current || { x, y };

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw locally immediately
                drawLine(ctx, prev.x, prev.y, x, y, color, brushSize);
            }
        }

        // Emit to server
        if (socketRef.current && (prev.x !== x || prev.y !== y)) {
            const data: DrawData = {
                x,
                y,
                prevX: prev.x,
                prevY: prev.y,
                color,
                size: brushSize
            };
            socketRef.current.emit('draw', data);
        }

        prevPos.current = { x, y };
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const image = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = image;
        link.download = `community-paint-${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{
            height: '100%',
            backgroundColor: '#c0c0c0',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Tahoma, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Toolbar */}
            <div style={{
                padding: '5px',
                borderBottom: '1px solid #808080',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: '#c0c0c0'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '110px', gap: '2px', border: '1px inset white', padding: '2px' }}>
                    {COLORS.map(c => (
                        <div
                            key={c}
                            onClick={() => setColor(c)}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: c,
                                border: color === c ? '2px solid black' : '1px solid gray',
                                cursor: 'pointer',
                                boxShadow: color === c ? 'inset 1px 1px 0px white' : 'none'
                            }}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px' }}>Size: {brushSize}px</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        style={{ width: '80px' }}
                    />
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="win98-btn" onClick={handleDownload} title="Save JPEG" style={{ padding: '3px' }}>
                        <Download size={16} />
                    </button>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#000080' }}>
                        <div>Canvas Reset In:</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ff0000' }}>{timeLeft}</div>
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#808080',
                padding: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    style={{
                        backgroundColor: 'white',
                        cursor: 'crosshair',
                        width: '100%', // Scale to fit container visually
                        maxWidth: '800px', // But don't exceed logical size too much
                        aspectRatio: '800/600',
                        boxShadow: '3px 3px 10px rgba(0,0,0,0.5)'
                    }}
                />
            </div>

            {/* Status Bar */}
            <div style={{ padding: '2px 5px', borderTop: '1px solid #fff', borderBottom: '1px solid #808080', fontSize: '11px' }}>
                Mode: Community_Online_V2 // Persistence: Server
            </div>

            {/* Disclaimer Modal */}
            {showDisclaimer && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="win98-box" style={{ width: '80%', maxWidth: '400px', backgroundColor: '#c0c0c0', padding: '10px' }}>
                        <div style={{ backgroundColor: '#000080', color: 'white', padding: '2px 5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <AlertTriangle size={14} color="yellow" />
                            WARNING
                        </div>
                        <div style={{ padding: '15px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>ONLINE COMMUNITY PAINT</p>
                            <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                This canvas is SHARED LIVE with everyone online.
                                <br /><br />
                                <strong>I AM NOT RESPONSIBLE FOR WHAT OTHERS DRAW HERE.</strong>
                                <br /><br />
                                Content resets automatically every month.
                                <br />
                                Be nice.
                            </p>
                            <button className="win98-btn" onClick={handleAgree} style={{ marginTop: '15px', padding: '5px 20px', fontWeight: 'bold' }}>
                                I UNDERSTAND
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
