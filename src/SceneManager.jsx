// src/SceneManager.jsx
import React, { Suspense } from 'react';
import { useMultiplayerState } from 'playroomkit';
import { Html, useProgress } from '@react-three/drei';

import Player from './components/3d/Player';
import Scene1_Cloud from './scenes/Scene1_Cloud';
import Scene2_Memory from './scenes/Scene2_Memory';
import Scene3_Forest from './scenes/Scene3_Forest';
import Scene4_Core from './scenes/Scene4_Core';
import Scene5_End from './scenes/Scene5_End';

// TẠO COMPONENT MÀN HÌNH CHỜ (LOADING SCREEN)
function LoadingScreen() {
    // Hook useProgress sẽ tự động đếm % tải các file 3D (.glb), hình ảnh, âm thanh...
    const { progress } = useProgress();

    return (
        <Html center zIndexRange={[99999, 0]}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: '100vw', height: '100vh', backgroundColor: '#09090b', color: '#38bdf8',
                fontFamily: 'sans-serif', pointerEvents: 'none'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px', letterSpacing: '2px', animation: 'pulse 1.5s infinite' }}>
                    ĐANG TẢI KÝ ỨC...
                </h2>

                {/* Thanh Progress Bar */}
                <div style={{ width: '400px', height: '12px', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '2px solid #38bdf8' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#38bdf8', transition: 'width 0.3s ease-out' }}></div>
                </div>

                <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#bae6fd' }}>
                    {Math.round(progress)}%
                </p>

                <style>{`
                    @keyframes pulse { 
                        0%, 100% { opacity: 1; text-shadow: 0 0 10px #38bdf8; } 
                        50% { opacity: 0.4; text-shadow: none; } 
                    }
                `}</style>
            </div>
        </Html>
    );
}

export default function SceneManager() {
    const [currentScene] = useMultiplayerState('globalScene', 'scene1');

    return (
        // BỌC TOÀN BỘ GAME TRONG SUSPENSE ĐỂ KÍCH HOẠT MÀN HÌNH LOADING
        <Suspense fallback={<LoadingScreen />}>
            <Player />
            {currentScene === 'scene1' && <Scene1_Cloud />}
            {currentScene === 'scene2' && <Scene2_Memory />}
            {currentScene === 'scene3' && <Scene3_Forest />}
            {currentScene === 'scene4' && <Scene4_Core />}
            {currentScene === 'scene5' && <Scene5_End />}
        </Suspense>
    )
}