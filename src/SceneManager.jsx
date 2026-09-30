import React, { Suspense, useEffect, useRef, lazy } from 'react';
import { useMultiplayerState } from 'playroomkit';
import { Html, useProgress } from '@react-three/drei';

import Player from './components/3d/Player';
// 1. Scene 1 tải ngay lập tức để người chơi có cái xem ngay
import Scene1_Cloud from './scenes/Scene1_Cloud';

// 2. Các Scene sau dùng kỹ thuật Lazy Load (Tải ngầm khi cần)
const Scene2_Memory = lazy(() => import('./scenes/Scene2_Memory'));
const Scene3_Forest = lazy(() => import('./scenes/Scene3_Forest'));
const Scene4_Core = lazy(() => import('./scenes/Scene4_Core'));
const Scene5_End = lazy(() => import('./scenes/Scene5_End'));

function LoadingScreen() {
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
                <div style={{ width: '400px', height: '12px', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '2px solid #38bdf8' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#38bdf8', transition: 'width 0.3s ease-out' }}></div>
                </div>
                <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#bae6fd' }}>
                    {Math.round(progress)}%
                </p>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; text-shadow: 0 0 10px #38bdf8; } 50% { opacity: 0.4; text-shadow: none; } }`}</style>
            </div>
        </Html>
    );
}

export default function SceneManager() {
    const [currentScene] = useMultiplayerState('globalScene', 'scene1');

    // TẠO REF ĐỂ ĐIỀU KHIỂN NHẠC NỀN
    const bgmRef = useRef();

    useEffect(() => {
        if (!bgmRef.current) return;

        // Cài đặt âm lượng (từ 0.0 đến 1.0) để không lấn át tiếng nhân vật
        bgmRef.current.volume = 0.3;

        // KIỂM TRA SCENE ĐỂ BẬT/TẮT NHẠC
        if (currentScene === 'scene4') {
            bgmRef.current.pause(); // Vào Scene 4 thì tắt để nghe bài Listening
        } else {
            // Các Scene khác thì bật lên
            // Bắt lỗi catch để tránh crash khi trình duyệt chặn tự động phát âm thanh lúc mới mở web
            bgmRef.current.play().catch((err) => console.log("Chờ người chơi click chuột để phát nhạc..."));
        }
    }, [currentScene]);

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Player />

            {/* THẺ AUDIO TOÀN CỤC CHẠY NGẦM BÊN DƯỚI GAME */}
            <Html>
                {/* LƯU Ý: Đổi 'nhac_nen.mp3' thành tên file thực tế của bạn */}
                <audio ref={bgmRef} src="/nhac_nen.mp3" loop />
            </Html>

            {currentScene === 'scene1' && <Scene1_Cloud />}
            {currentScene === 'scene2' && <Scene2_Memory />}
            {currentScene === 'scene3' && <Scene3_Forest />}
            {currentScene === 'scene4' && <Scene4_Core />}
            {currentScene === 'scene5' && <Scene5_End />}
        </Suspense>
    )
}