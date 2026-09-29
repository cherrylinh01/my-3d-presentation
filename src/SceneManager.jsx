import { useMultiplayerState } from 'playroomkit'
import Scene1_Cloud from './scenes/Scene1_Cloud'
import Scene2_Memory from './scenes/Scene2_Memory'
import Scene3_Forest from './scenes/Scene3_Forest'
import Scene4_Core from './scenes/Scene4_Core'
import Scene5_End from './scenes/Scene5_End'
import Player from './components/3d/Player'

export default function SceneManager() {
    // Chỉ duy nhất SceneManager lắng nghe mạng
    const [currentScene, setCurrentScene] = useMultiplayerState('globalScene', 'scene1');

    // Hàm chuyển cảnh nội bộ, ép React cập nhật lập tức
    const changeScene = (sceneName) => {
        setCurrentScene(sceneName);
    };

    return (
        <>
            <Player />
            {/* Truyền hàm changeScene xuống cho Scene 1 qua prop onSceneChange */}
            {currentScene === 'scene1' && <Scene1_Cloud onSceneChange={changeScene} />}
            {currentScene === 'scene2' && <Scene2_Memory />}
            {currentScene === 'scene3' && <Scene3_Forest />}
            {currentScene === 'scene4' && <Scene4_Core />}
            {currentScene === 'scene5' && <Scene5_End />}
        </>
    )
}