// src/SceneManager.jsx
import { getState } from 'playroomkit'
import { useState, useEffect } from 'react'
import Scene1_Cloud from './scenes/Scene1_Cloud'
import Scene2_Memory from './scenes/Scene2_Memory'
import Scene3_Forest from './scenes/Scene3_Forest'
import Scene4_Core from './scenes/Scene4_Core'
import Scene5_End from './scenes/Scene5_End';
import Player from './components/3d/Player'

import { useMultiplayerState } from 'playroomkit'

export default function SceneManager() {
    // Khởi tạo state cục bộ bằng với state chung của phòng
    const [currentScene, setCurrentScene] = useMultiplayerState('globalScene', 'scene1');
    useEffect(() => {
        // Kiểm tra liên tục (mỗi 200ms) xem Host đã cập nhật 'currentScene' trên Playroom chưa
        const interval = setInterval(() => {
            const globalScene = getState('currentScene') || 'scene1';
            setCurrentScene((prevScene) => {
                if (prevScene !== globalScene) {
                    return globalScene;
                }
                return prevScene;
            });
        }, 200);

        // Dọn dẹp interval khi component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Player luôn tồn tại xuyên suốt các màn */}
            <Player />

            {/* Chuyển cảnh: Unmount màn cũ, Mount màn mới để dọn VRAM */}
            {currentScene === 'scene1' && <Scene1_Cloud />}
            {currentScene === 'scene2' && <Scene2_Memory />}
            {currentScene === 'scene3' && <Scene3_Forest />}
            {currentScene === 'scene4' && <Scene4_Core />}
            {currentScene === 'scene5' && <Scene5_End />}
        </>
    )
}