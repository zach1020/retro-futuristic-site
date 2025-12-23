import React from 'react';
import { ExternalLink, Heart, Twitch, Twitter, Linkedin, Cloud, Music, Disc } from 'lucide-react';

export const SystemInfoApp: React.FC = () => {
    return (
        <div style={{
            height: '100%',
            backgroundColor: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
        }}>
            <div style={{
                border: '1px solid #0f0',
                padding: '15px',
                textAlign: 'center',
                boxShadow: '0 0 10px #0f0'
            }}>
                <h2 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>System Credits</h2>
                <div style={{ fontSize: '12px', marginBottom: '10px' }}>INSPIRATION_CORE_DUMP:</div>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                    Massive shoutout to the visionaries at <a href="https://poolsuite.net" target="_blank" style={{ color: '#fff', textDecoration: 'underline' }}>poolsuite.net</a>.
                    <br />
                    Your aesthetic currents power this digital dreamscape.
                </p>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '5px', color: '#ff69b4' }}>
                    <Heart fill="#ff69b4" size={16} />
                </div>
            </div>

            <div style={{
                border: '1px dashed #0f0',
                padding: '15px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px dashed #0f0', paddingBottom: '5px' }}>:: USER_SOCIAL_UPLINK ::</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <a href="https://www.twitch.tv/berniece_anders" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer' }}>
                        <Twitch size={20} />
                        <span>twitch.tv/berniece_anders</span>
                        <ExternalLink size={12} />
                    </a>

                    <a href="https://x.com/Elroy_Muscato" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer' }}>
                        <Twitter size={20} />
                        <span>@Elroy_Muscato</span>
                        <ExternalLink size={12} />
                    </a>

                    <a href="https://www.linkedin.com/in/zachary-bohl-2092581ab/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer' }}>
                        <Linkedin size={20} />
                        <span>Zachary Bohl</span>
                        <ExternalLink size={12} />
                    </a>

                    <div style={{ height: '1px', background: 'rgba(0, 255, 0, 0.3)', margin: '5px 0' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', color: '#ff00ff' }}>
                            MUSIC_ALIAS: CAPYBARA WATANABE
                        </div>

                        <a href="https://soundcloud.com/capybara-watanabe" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer', paddingLeft: '10px' }}>
                            <Cloud size={20} />
                            <span>SoundCloud</span>
                            <ExternalLink size={12} />
                        </a>

                        <a href="https://music.apple.com/us/artist/capybara-watanabe/1691089114" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer', paddingLeft: '10px' }}>
                            <Music size={20} />
                            <span>Apple Music</span>
                            <ExternalLink size={12} />
                        </a>

                        <a href="https://open.spotify.com/artist/7wgD7QbIEMZREnLzl3U4Vk?si=XkI1UmDtS76NMy7QeTaKbA" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f0', textDecoration: 'none', cursor: 'pointer', paddingLeft: '10px' }}>
                            <Disc size={20} />
                            <span>Spotify</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '10px', textAlign: 'center', opacity: 0.5, marginTop: 'auto' }}>
                SYSTEM_ID: RETRO_FUTURE_V1.0
                <br />
                BUILD_DATE: 2025-12-23
            </div>
        </div>
    );
};
