// src/App.jsx
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import SceneManager from './SceneManager'
import SlideOverlay from './components/ui/SlideOverlay'

export default function App() {
  return (
    <>
      {/* Lớp UI 2D đè lên trên cùng */}
      <SlideOverlay />

      {/* Lớp không gian 3D */}
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Physics debug={false}> {/* Đổi debug={true} để xem lưới va chạm */}
            <SceneManager />
          </Physics>
        </Suspense>
      </Canvas>
    </>
  )
}