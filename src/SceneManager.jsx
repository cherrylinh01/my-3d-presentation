// src/SceneManager.jsx
import { useMultiplayerState } from 'playroomkit';

// BẮT BUỘC PHẢI IMPORT ĐẦY ĐỦ PLAYER VÀ 5 SCENE
import Player from './components/3d/Player';
import Scene1_Cloud from './scenes/Scene1_Cloud';
import Scene2_Memory from './scenes/Scene2_Memory';
import Scene3_Forest from './scenes/Scene3_Forest';
import Scene4_Core from './scenes/Scene4_Core';
import Scene5_End from './scenes/Scene5_End';

export default function SceneManager() {
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