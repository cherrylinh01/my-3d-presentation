// src/scenes/Scene5_End.jsx
import React from 'react'
import { Text, Environment, Float, Sparkles, Stars } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// 1. IMPORT HOOK CỦA PLAYROOMKIT
import { useMultiplayerState } from 'playroomkit'

export default function Scene5_End() {
    // 2. MÓC ĐIỂM SỐ TỪ SCENE 3 BẰNG ĐÚNG TỪ KHÓA 'scene3_score'
    const [score] = useMultiplayerState('scene3_score', 0);

    return (
        <group>
            <color attach="background" args={['#020617']} />
            <Environment preset="night" />
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 20, 0]} intensity={5} angle={0.8} penumbra={0.5} color="#fef08a" />

            <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
            <Sparkles count={300} scale={30} size={10} speed={0.4} color="#fbbf24" opacity={0.8} />

            {/* Sàn vinh quang */}
            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[20, 20, 1, 64]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.2} />
                </mesh>

                {/* Vòng tròn neon lấp lánh trên sàn */}
                <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[14, 15, 64]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[8, 8.5, 64]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} side={THREE.DoubleSide} />
                </mesh>
            </RigidBody>

            {/* Khối pha lê tượng trưng cho thành công lơ lửng */}
            <Float speed={2} floatIntensity={1} rotationIntensity={1}>
                <mesh position={[0, 5, -8]} castShadow>
                    <octahedronGeometry args={[2.5, 0]} />
                    <meshPhysicalMaterial
                        color="#fbbf24"
                        emissive="#b45309"
                        emissiveIntensity={1}
                        roughness={0}
                        metalness={1}
                        transmission={0.5}
                    />
                </mesh>
            </Float>

            {/* 3. BẢNG ĐIỂM 3D HIỂN THỊ ĐIỂM TỪ SCENE 3 TRUYỀN SANG */}
            <Float speed={3} floatIntensity={0.5} rotationIntensity={0.1}>
                <group position={[0, 9.5, -8]}> {/* Đặt lơ lửng ngay trên khối pha lê */}
                    <Text position={[0, 1.2, 0]} fontSize={0.8} color="#fbbf24" outlineWidth={0.03} outlineColor="#000">
                        FINAL TEAM SCORE
                    </Text>
                    <Text position={[0, 0, 0]} fontSize={2.5} fontWeight="bold" color={score > 0 ? "#4ade80" : "#f87171"} outlineWidth={0.05} outlineColor="#000">
                        {score}
                    </Text>
                </group>
            </Float>

            {/* Dòng chữ triết lý lơ lửng (Được đẩy lên cao hơn một chút để nhường chỗ cho bảng điểm) */}
            <Float speed={1.5} floatIntensity={0.2}>
                <Text position={[0, 13, -12]} fontSize={1} color="#ffffff" maxWidth={20} textAlign="center" outlineWidth={0.02} outlineColor="#000">
                    "The success you dream of may not feel like success when you finally get it."
                </Text>
                <Text position={[0, 11.5, -12]} fontSize={0.6} color="#38bdf8" outlineWidth={0.02} outlineColor="#000">
                    Enjoy the journey. You are the true success.
                </Text>
            </Float>
        </group>
    )
}