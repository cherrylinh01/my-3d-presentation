import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import SceneManager from './SceneManager'
import SlideOverlay from './components/ui/SlideOverlay'

export default function App() {
  return (
    // Thêm position: 'relative' làm khung chứa chuẩn
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Lớp UI 2D (SlideOverlay nên được code CSS position: absolute/fixed bên trong nó để đè lên game) */}
      <SlideOverlay />

      {/* Ép Canvas hiển thị ở tọa độ tuyệt đối, phủ kín màn hình */}
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
      >
        <Suspense fallback={null}>
          <Physics debug={false}>
            <SceneManager />
          </Physics>
        </Suspense>
      </Canvas>

    </div>
  )
}