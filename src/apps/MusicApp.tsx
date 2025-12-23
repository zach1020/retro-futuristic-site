import React, { useState } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const playlist = [
    { title: "Rocking the boat", file: "/music/Rocking the Boat.mp3" },
    { title: "Baplicity", file: "/music/Baplicity.mp3" },
    { title: "Comeback or nah?", file: "/music/Comeback%20or%20Nah.mp3" },
    { title: "Hoping to be found", file: "/music/Hoping to Be Found.mp3" },
    { title: "Vaguely discontented", file: "/music/Vaguely Discontented.mp3" },
    { title: "Interdimensional", file: "/music/Interdimensional.mp3" },
    { title: "Twilight chops", file: "/music/Twilight Chops.mp3" },
];

export const MusicApp: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(0.5);

    // Audio Context Refs
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const animationRef = React.useRef<number>(0);

    const handleNext = React.useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }, []);

    const handlePrev = React.useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }, []);

    const togglePlay = React.useCallback(() => setIsPlaying(p => !p), []);

    const playTrack = React.useCallback((index: number) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    }, []);

    // Initialize Audio Element
    React.useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.crossOrigin = "anonymous";
            audioRef.current.src = playlist[0].file;
            audioRef.current.volume = volume;
        }
        return () => {
            // Cleanup handled in separate effects mainly, but pause here safely
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Handle 'ended' event for auto-play
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => {
            handleNext();
        };

        audio.addEventListener('ended', onEnded);
        return () => audio.removeEventListener('ended', onEnded);
    }, [handleNext]);

    // Volume Sync Effect
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Setup Web Audio API
    const setupAudioContext = () => {
        if (!audioContextRef.current && audioRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64; // Small FFT for "tiny bars" chunky look

            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#fffdf9'; // Clear with light BG
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Color: Black for that e-ink high contrast look
                ctx.fillStyle = '#000000';

                // Draw solid bars for Mac look
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth + 1;
            }

            if (isPlaying) {
                animationRef.current = requestAnimationFrame(render);
            }
        };
        render();
    };

    // Track Change Effect
    React.useEffect(() => {
        if (audioRef.current) {
            const wasPlaying = isPlaying;
            audioRef.current.src = playlist[currentIndex].file;
            if (wasPlaying) {
                audioRef.current.play()
                    .then(() => {
                        setupAudioContext(); // Ensure connected
                        drawVisualizer();
                    })
                    .catch(console.error);
            }
        }
    }, [currentIndex]);

    // Play/Pause Effect
    React.useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                setupAudioContext();
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                audioRef.current.play()
                    .then(() => drawVisualizer())
                    .catch(console.error);
            } else {
                audioRef.current.pause();
                cancelAnimationFrame(animationRef.current);
            }
        }
    }, [isPlaying]);

    const currentTrack = playlist[currentIndex];

    return (
        <div style={{
            backgroundColor: '#fffdf9', // Cream BG
            color: '#000',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Geneva, Verdana, sans-serif',
            padding: '4px',
            border: '1px solid #000'
        }}>
            {/* Display */}
            <div style={{
                backgroundColor: '#e0e0e0',
                border: '1px solid #000',
                marginBottom: '5px',
                padding: '5px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'Monaco, monospace'
            }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {isPlaying ? `PLAYING: ${currentTrack.title}` : `STOPPED: ${currentTrack.title}`}
                </span>
                <span>{isPlaying ? '00:00' : '--:--'}</span>
            </div>

            {/* Visualizer */}
            <canvas
                ref={canvasRef}
                style={{
                    height: '60px',
                    width: '100%',
                    backgroundColor: '#fff', // Light BG
                    marginBottom: '5px',
                    border: '1px solid #000'
                }}
                width={300}
                height={60}
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '10px', alignItems: 'center' }}>
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={handlePrev}><SkipBack size={12} /></button>
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={togglePlay}>
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={() => setIsPlaying(false)}><Square size={12} /></button>
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={handleNext}><SkipForward size={12} /></button>

                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px', gap: '4px' }}>
                    <Volume2 size={14} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{ width: '60px', height: '10px', cursor: 'pointer' }}
                    />
                </div>
            </div>

            {/* Playlist */}
            <div style={{
                flex: 1,
                backgroundColor: '#fff',
                border: '1px solid #000',
                color: '#000',
                padding: '2px',
                fontSize: '12px',
                overflowY: 'auto'
            }}>
                {playlist.map((track, i) => (
                    <div
                        key={i}
                        onClick={() => playTrack(i)}
                        style={{
                            cursor: 'pointer',
                            color: i === currentIndex ? '#fff' : '#000',
                            backgroundColor: i === currentIndex ? '#000' : 'transparent',
                            padding: '1px 2px'
                        }}
                    >
                        {i + 1}. {track.title}
                    </div>
                ))}
            </div>
        </div>
    );
};
