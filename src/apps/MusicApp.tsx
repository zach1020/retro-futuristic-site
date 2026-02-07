import React, { useState } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Zap, Music } from 'lucide-react';
import { GenerativeEngine, type GenMode } from '../audio/GenerativeEngine';

const playlist = [
    { title: "Rocking the boat", file: "/music/Rocking the Boat.mp3" },
    { title: "Baplicity", file: "/music/Baplicity.mp3" },
    { title: "Comeback or nah?", file: "/music/Comeback%20or%20Nah.mp3" },
    { title: "Hoping to be found", file: "/music/Hoping to Be Found.mp3" },
    { title: "Vaguely discontented", file: "/music/Vaguely Discontented.mp3" },
    { title: "Interdimensional", file: "/music/Interdimensional.mp3" },
    { title: "Twilight chops", file: "/music/Twilight Chops.mp3" },
    { title: "Back to the drawing board", file: "/music/Back to the Drawing Board.mp3" },
    { title: "Rippling compression", file: "/music/Rippling Compression.mp3" },
    { title: "Second city cafe", file: "/music/Second City Cafe.mp3" },
    { title: "Watanabe", file: "/music/Watanabe.mp3" },
    { title: "Till break of day", file: "/music/Till Break of Day.mp3" },
];

export const MusicApp: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [generativeMode, setGenerativeMode] = useState(false);
    const [genMode, setGenMode] = useState<GenMode>('ambient');

    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const animationRef = React.useRef<number>(0);
    const engineRef = React.useRef<GenerativeEngine | null>(null);
    const generativeModeRef = React.useRef(generativeMode);
    generativeModeRef.current = generativeMode;

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
            if (audioRef.current) audioRef.current.pause();
            if (audioContextRef.current) audioContextRef.current.close();
            if (engineRef.current?.isRunning) engineRef.current.stop();
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Handle audio events
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => handleNext();
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
        };
    }, [handleNext]);

    // Volume sync
    React.useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
        engineRef.current?.setVolume(volume);
    }, [volume]);

    // Setup Web Audio API (tracks mode)
    const setupAudioContext = () => {
        if (!audioContextRef.current && audioRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
        }
    };

    const drawVisualizer = () => {
        const isGen = generativeModeRef.current;
        const activeAnalyser = isGen
            ? engineRef.current?.getAnalyser()
            : analyserRef.current;
        if (!canvasRef.current || !activeAnalyser) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = activeAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            activeAnalyser.getByteFrequencyData(dataArray);
            ctx.fillStyle = '#fffdf9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                x += barWidth + 1;
            }
            animationRef.current = requestAnimationFrame(render);
        };
        render();
    };

    // Track Change Effect
    React.useEffect(() => {
        if (audioRef.current && !generativeMode) {
            const wasPlaying = isPlaying;
            audioRef.current.src = playlist[currentIndex].file;
            if (wasPlaying) {
                audioRef.current.play()
                    .then(() => {
                        setupAudioContext();
                        drawVisualizer();
                    })
                    .catch(console.error);
            }
        }
    }, [currentIndex]);

    // Play/Pause Effect (handles both modes)
    React.useEffect(() => {
        cancelAnimationFrame(animationRef.current);

        if (generativeMode) {
            audioRef.current?.pause();

            if (isPlaying) {
                const go = async () => {
                    if (!engineRef.current) {
                        engineRef.current = new GenerativeEngine();
                    }
                    if (!engineRef.current.isRunning) {
                        engineRef.current.setMode(genMode);
                        engineRef.current.setVolume(volume);
                        await engineRef.current.start();
                    }
                    drawVisualizer();
                };
                go();
            } else {
                if (engineRef.current?.isRunning) {
                    engineRef.current.stop();
                    engineRef.current = null;
                }
            }
        } else {
            if (engineRef.current?.isRunning) {
                engineRef.current.stop();
                engineRef.current = null;
            }

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
                }
            }
        }
    }, [isPlaying, generativeMode]);

    // Gen mode (ambient/edm) change
    React.useEffect(() => {
        engineRef.current?.setMode(genMode);
    }, [genMode]);

    // Mouse tracking for generative mode
    React.useEffect(() => {
        const onMove = (e: MouseEvent) => {
            engineRef.current?.setMouse(
                e.clientX / window.innerWidth,
                e.clientY / window.innerHeight
            );
        };
        const onClick = () => engineRef.current?.onClick();
        document.addEventListener('mousemove', onMove);
        document.addEventListener('click', onClick);
        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('click', onClick);
        };
    }, []);

    const currentTrack = playlist[currentIndex];

    const switchToGenerative = (on: boolean) => {
        if (on === generativeMode) return;
        setIsPlaying(false);
        setTimeout(() => setGenerativeMode(on), 50);
    };

    return (
        <div style={{
            backgroundColor: '#fffdf9',
            color: '#000',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Geneva, Verdana, sans-serif',
            padding: '4px',
            border: '1px solid #000'
        }}>
            {/* Mode Tabs */}
            <div style={{ display: 'flex', marginBottom: '4px', gap: '1px' }}>
                <button
                    className="win98-btn"
                    onClick={() => switchToGenerative(false)}
                    style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        fontWeight: !generativeMode ? 'bold' : 'normal',
                        backgroundColor: !generativeMode ? '#000' : '#fff',
                        color: !generativeMode ? '#fff' : '#000',
                        fontSize: '10px',
                        padding: '3px 4px',
                    }}
                >
                    <Music size={10} /> TRACKS
                </button>
                <button
                    className="win98-btn"
                    onClick={() => switchToGenerative(true)}
                    style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        fontWeight: generativeMode ? 'bold' : 'normal',
                        backgroundColor: generativeMode ? '#000' : '#fff',
                        color: generativeMode ? '#fff' : '#000',
                        fontSize: '10px',
                        padding: '3px 4px',
                    }}
                >
                    <Zap size={10} /> GENERATIVE
                </button>
            </div>

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
                fontFamily: 'Monaco, monospace',
                gap: '8px'
            }}>
                {generativeMode ? (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                        {isPlaying
                            ? `GENERATING: ${genMode === 'ambient' ? 'Ambient' : 'EDM'}`
                            : 'GENERATIVE: Ready'}
                    </span>
                ) : (
                    <>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                            {isPlaying ? `PLAYING: ${currentTrack.title}` : `STOPPED: ${currentTrack.title}`}
                        </span>
                        <span style={{ flexShrink: 0 }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </>
                )}
            </div>

            {/* Visualizer */}
            <canvas
                ref={canvasRef}
                style={{
                    height: '60px',
                    width: '100%',
                    backgroundColor: '#fff',
                    marginBottom: '5px',
                    border: '1px solid #000'
                }}
                width={300}
                height={60}
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '10px', alignItems: 'center' }}>
                {!generativeMode && (
                    <button className="win98-btn" style={{ minWidth: '30px' }} onClick={handlePrev}><SkipBack size={12} /></button>
                )}
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={togglePlay}>
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button className="win98-btn" style={{ minWidth: '30px' }} onClick={() => setIsPlaying(false)}><Square size={12} /></button>
                {!generativeMode && (
                    <button className="win98-btn" style={{ minWidth: '30px' }} onClick={handleNext}><SkipForward size={12} /></button>
                )}

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

            {/* Playlist / Generative Controls */}
            {generativeMode ? (
                <div style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                    padding: '8px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                    {/* Mode selector */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                            className="win98-btn"
                            onClick={() => setGenMode('ambient')}
                            style={{
                                flex: 1, fontSize: '11px', padding: '4px',
                                backgroundColor: genMode === 'ambient' ? '#000' : '#fff',
                                color: genMode === 'ambient' ? '#fff' : '#000',
                            }}
                        >
                            AMBIENT
                        </button>
                        <button
                            className="win98-btn"
                            onClick={() => setGenMode('edm')}
                            style={{
                                flex: 1, fontSize: '11px', padding: '4px',
                                backgroundColor: genMode === 'edm' ? '#000' : '#fff',
                                color: genMode === 'edm' ? '#fff' : '#000',
                            }}
                        >
                            EDM
                        </button>
                    </div>

                    <div style={{ fontFamily: 'Monaco, monospace', fontSize: '10px', color: '#555', lineHeight: 1.6 }}>
                        {genMode === 'ambient' ? (
                            <>
                                <div>Move mouse to shape the sound.</div>
                                <div>X-axis = brightness, Y-axis = depth</div>
                                <div>Click anywhere for chimes.</div>
                                <div style={{ marginTop: '6px', color: '#999' }}>Chords shift every 10s.</div>
                            </>
                        ) : (
                            <>
                                <div>Mouse controls the filter + arp.</div>
                                <div>X-axis = cutoff, Y-axis = space</div>
                                <div>Click for impacts.</div>
                                <div style={{ marginTop: '6px', color: '#999' }}>128 BPM // C minor</div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
};
