// src/scenes/Scene1_Cloud.jsx
import React, { useMemo, useEffect } from 'react'
import { Environment, Sky, Float, Text, ContactShadows } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import DynamicModel from '../components/3d/DynamicModel'

// CHÚ Ý: Đã xóa useMultiplayerState, chỉ giữ lại isHost
import { isHost } from 'playroomkit'

// Nhận hàm onSceneChange từ SceneManager truyền xuống (props)
export default function Scene1_Cloud({ onSceneChange }) {

    // CÁCH 1: Va chạm bằng cách đi vào (gọi thẳng hàm của Cha)
    const handleStartCollision = () => {
        onSceneChange('scene2');
    };

    // CÁCH 2: PHÍM TẮT ẨN DÀNH CHO TRƯỞNG PHÒNG
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Nếu bấm phím Enter VÀ đang là Trưởng phòng -> Ép chuyển sang Scene 2
            if (e.key === 'Enter' && isHost()) {
                onSceneChange('scene2');
            }
        };

        // Bật lắng nghe bàn phím
        window.addEventListener('keydown', handleKeyDown);

        // Dọn dẹp khi chuyển sang màn khác
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSceneChange]);

    const floatingClouds = useMemo(() => {
        const clouds = [];
        for (let i = 0; i < 50; i++) {
            const radius = 15 + Math.random() * 40;
            const theta = Math.random() * 2 * Math.PI;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            const y = (Math.random() - 0.5) * 20;

            clouds.push({
                id: i,
                position: [x, y, z],
                rotation: [0, Math.random() * Math.PI, 0],
                scale: 1 + Math.random() * 3,
            });
        }
        return clouds;
    }, []);

    return (
        <group>
            <Environment preset="sunset" />
            <Sky sunPosition={[10, 5, -10]} turbidity={0.3} rayleigh={0.8} />
            <ambientLight intensity={0.6} />
            <directionalLight castShadow position={[10, 20, 10]} intensity={1.5} color="#ffd8a8" />

            {/* Sàn cỏ */}
            <RigidBody type="fixed" position={[0, -1, 0]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[20, 22, 1, 64]} />
                    <meshStandardMaterial color="#4ade80" />
                </mesh>
            </RigidBody>

            {/* Bảng Danh sách nhóm */}
            <Float speed={2} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
                <group position={[10, 3, -5]} rotation={[0, -0.4, 0]}>
                    <Text
                        position={[0, 0, 0]}
                        fontSize={0.5}
                        color="#ffffff"
                        outlineWidth={0.03}
                        outlineColor="#000000"
                        textAlign="center"
                        lineHeight={1.6}
                    >
                        DANH SÁCH NHÓM{"\n"}
                        Nguyễn Nhật Duy - 2510059{"\n"}
                        Cao Ngọc Khánh Linh - 2510338{"\n"}
                        Nguyễn Nhật Linh - 2513057{"\n"}
                        Trương Thị Thuý Trang - 2513282{"\n"}
                        Nguyễn Nhật Duy - 2511588
                    </Text>
                </group>
            </Float>

            {/* Nút START (vẫn giữ lại khối va chạm) */}
            <RigidBody type="fixed" colliders={false} position={[0, 1.5, -8]}>
                <CuboidCollider args={[3, 2, 1]} sensor onIntersectionEnter={handleStartCollision} />
                <Float speed={4} floatIntensity={0.5}>
                    <Text
                        fontSize={1.5}
                        color="#eab308"
                        outlineWidth={0.08}
                        outlineColor="#ca8a04"
                    >
                        START
                    </Text>
                </Float>
            </RigidBody>

            {/* Rải mây 3D */}
            {floatingClouds.map((cloud) => (
                <Float key={cloud.id} speed={1.5} floatIntensity={1}>
                    <DynamicModel fileName="cloudfake.glb" position={cloud.position} rotation={cloud.rotation} scale={cloud.scale} />
                </Float>
            ))}

            <ContactShadows resolution={1024} scale={50} blur={3} opacity={0.3} far={15} />
        </group>
    )
}