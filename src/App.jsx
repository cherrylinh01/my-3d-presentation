import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import SceneManager from './SceneManager'
import SlideOverlay from './components/ui/SlideOverlay'

import { Html, useProgress } from '@react-three/drei'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        Đang tải thế giới... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

export default function App() {
  return (
    // Thêm position: 'relative' làm khung chứa chuẩn
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Lớp UI 2D (SlideOverlay nên được code CSS position: absolute/fixed bên trong nó để đè lên game) */}
      <SlideOverlay />

      {/* Ép Canvas hiển thị ở tọa độ tuyệt đối, phủ kín màn hình */}
      <Canvas
        gl={{ antialias: false }} // TẮT khử răng cưa
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows={false} // Khuyến nghị tắt luôn shadows nếu không bắt buộc
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