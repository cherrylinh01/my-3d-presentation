import { useMultiplayerState } from 'playroomkit'; // BẮT BUỘC PHẢI CÓ DÒNG NÀY Ở ĐẦU FILE

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