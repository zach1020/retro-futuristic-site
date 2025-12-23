import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle, Download } from 'lucide-react';

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

export const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ff00ff');
    const [brushSize, setBrushSize] = useState(2);
    const [timeLeft, setTimeLeft] = useState('');
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    // Disclaimer Check
    useEffect(() => {
        const hasAgreed = localStorage.getItem('paint_disclaimer_agreed');
        if (hasAgreed) {
            setShowDisclaimer(false);
        }
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

    // Canvas Setup & Persistence
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Canvas Size (fixed for consistency)
        // In a real networked app, this would be a fixed grid.
        canvas.width = 800;
        canvas.height = 600;

        // Fill white background default
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load Data
        const savedData = localStorage.getItem('community_paint_data');
        const lastMonth = localStorage.getItem('paint_last_month');
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        if (savedData && lastMonth === currentMonth) {
            const img = new Image();
            img.src = savedData;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
        } else {
            // New month or no data => Clear/Reset
            localStorage.setItem('paint_last_month', currentMonth);
            localStorage.removeItem('community_paint_data');
            // Background is already white
        }
    }, []);

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL();
        localStorage.setItem('community_paint_data', data);
    };

    // Drawing Handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // Reset path
            saveCanvas();
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate position relative to canvas
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

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
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
                Mode: Community_V1 // Local_Persistence_Active
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
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>COMMUNITY PAINT PROTOCOL</p>
                            <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                This canvas is open to the public.
                                <br /><br />
                                <strong>I AM NOT RESPONSIBLE FOR WHAT OTHERS DRAW HERE.</strong>
                                <br /><br />
                                Content resets automatically every month.
                                <br />
                                Please keep it cool.
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
