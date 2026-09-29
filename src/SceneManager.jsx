// src/SceneManager.jsx
import Scene1_Cloud from './scenes/Scene1_Cloud'
import Scene2_Memory from './scenes/Scene2_Memory'
import Scene3_Forest from './scenes/Scene3_Forest'
import Scene4_Core from './scenes/Scene4_Core'
import Scene5_End from './scenes/Scene5_End';
import Player from './components/3d/Player'

import { useMultiplayerState } from 'playroomkit'

export default function SceneManager() {
    // Chỉ cần ĐÚNG 1 dòng này, PlayroomKit sẽ tự lo phần đồng bộ mạng
    const [currentScene] = useMultiplayerState('globalScene', 'scene1');

    return (
        <>
            <Player />
            {currentScene === 'scene1' && <Scene1_Cloud />}
            {currentScene === 'scene2' && <Scene2_Memory />}
            {currentScene === 'scene3' && <Scene3_Forest />}
            {currentScene === 'scene4' && <Scene4_Core />}
            {currentScene === 'scene5' && <Scene5_End />}
        </>
    )
}