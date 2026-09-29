import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Text, Float, Sparkles, Stars, Html, useTexture } from '@react-three/drei'
import { setState } from 'playroomkit'
import * as THREE from 'three'

import { setState, isHost, useMultiplayerState } from 'playroomkit' // Nhớ import thêm

function RotatingObstacle({ position, speed = 2 }) {
    const bodyRef = useRef();
    useFrame((state) => {
        if (!bodyRef.current) return;
        const euler = new THREE.Euler(0, state.clock.getElapsedTime() * speed, 0);
        bodyRef.current.setNextKinematicRotation(new THREE.Quaternion().setFromEuler(euler));
    });
    return (
        <RigidBody ref={bodyRef} type="kinematicPosition" position={position}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[4, 0.4, 0.4]} />
                <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.5} />
            </mesh>
        </RigidBody>
    );
}

function MovingPlatform({ position, note, movementType = 'horizontal', speed = 1.5, range = 3 }) {
    const bodyRef = useRef();
    const initialPos = useRef(new THREE.Vector3(...position));
    useFrame((state) => {
        if (!bodyRef.current) return;
        const currentPos = new THREE.Vector3().copy(initialPos.current);
        if (movementType === 'horizontal') currentPos.x += Math.sin(state.clock.getElapsedTime() * speed) * range;
        else if (movementType === 'vertical') currentPos.y += Math.sin(state.clock.getElapsedTime() * speed) * (range * 0.7);
        bodyRef.current.setNextKinematicTranslation(currentPos);
    });
    return (
        <RigidBody ref={bodyRef} type="kinematicPosition" position={position} friction={2}>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.0, 0.4, 6]} />
                {/* Đổi từ meshPhysicalMaterial sang meshStandardMaterial */}
                <meshStandardMaterial color="#c084fc" transparent opacity={0.8} roughness={0.5} />            </mesh>
            <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#bae6fd" outlineWidth={0.02} outlineColor="#000">{note}</Text>
            </Float>
        </RigidBody>
    );
}

export default function Scene4_Core() {
    // Kích hoạt state quản lý luồng game
    const [phase, setPhase] = useMultiplayerState('scene4_phase', 'intro_mindmap');
    // Tải ảnh Mindmap từ thư mục public (nhớ để file tên mindmap_scene4.jpg vào thư mục public)
    const mindmapTex = useTexture('/mindmap_scene4.jpg');

    // =======================================================
    // 1. DỊCH CHUYỂN AN TOÀN KHI VỪA BƯỚC SANG SCENE 4
    // =======================================================
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('teleportPlayer', { detail: { x: 0, y: 5, z: 5 } }));
    }, []);

    // 2. BẤM ENTER ĐỂ BẮT ĐẦU CHƠI OBBY
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Chỉ Host bấm Enter thì mới đổi phase cho cả phòng
            if (phase === 'intro_mindmap' && e.key === 'Enter' && isHost()) {
                setPhase('playing');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase]);

    const handleEndGame = () => {
        if (isHost()) {
            setState('globalScene', 'scene5');
        }
    };
    // Tạo đường chạy Obby với các từ khóa Note-taking thay vì nốt nhạc
    const obbyPath = useMemo(() => {
        const platforms = [];
        const noteKeywords = ['interview', '8:30', 'Mon', 'w/o', '[!]', 'b4', '→', 'hrs', 'info', 'exp.'];
        for (let i = 1; i <= 10; i++) {
            platforms.push({
                id: i,
                position: [Math.sin(i * 0.8) * 2, Math.abs(Math.sin(i * 0.5)) * 1, 5 - i * 3.5],
                note: noteKeywords[(i - 1) % noteKeywords.length],
                isMoving: (i === 3 || i === 6 || i === 8),
                movementType: i === 8 ? 'vertical' : 'horizontal'
            });
        }
        return platforms;
    }, []);

    return (
        <group>
            <color attach="background" args={['#09090b']} />
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, -10]} intensity={2} color="#d8b4fe" />
            <pointLight position={[0, 5, -15]} intensity={5} color="#818cf8" distance={30} />

            <Sparkles count={50} scale={40} size={6} speed={0.4} color="#f472b6" opacity={0.4} />
            <Stars radius={50} depth={50} count={200} factor={4} saturation={1} fade speed={2} />

            {/* BỤC XUẤT PHÁT */}
            <RigidBody type="fixed" position={[0, -1, 5]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[3, 3, 0.5, 32]} />
                    <meshStandardMaterial color="#312e81" metalness={0.5} roughness={0.2} />
                </mesh>
            </RigidBody>

            {/* BẢNG MINDMAP 3D LƠ LỬNG Ở ĐẦU ĐƯỜNG CHẠY */}
            {phase === 'playing' && (
                <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
                    <mesh position={[0, 4, 1.5]}>
                        <boxGeometry args={[8, 4.5, 0.2]} />
                        <meshStandardMaterial map={mindmapTex} emissive="#222222" />
                    </mesh>
                </Float>
            )}

            {/* CÁC BỤC NHẢY OBBY CHỨA TỪ KHÓA */}
            {phase === 'playing' && obbyPath.map((plat) => (
                plat.isMoving ?
                    <MovingPlatform key={`moving-${plat.id}`} position={plat.position} note={plat.note} movementType={plat.movementType} />
                    :
                    <RigidBody key={plat.id} type="fixed" position={plat.position}>
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[2.5, 2.0, 0.4, 6]} />
                            {/* Đổi từ meshPhysicalMaterial sang meshStandardMaterial */}
                            <meshStandardMaterial color="#c084fc" transparent opacity={0.8} roughness={0.5} />                        </mesh>
                        <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Text position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#fbcfe8" outlineWidth={0.02} outlineColor="#000">{plat.note}</Text>
                        </Float>
                    </RigidBody>
            ))}

            {/* ĐÍCH ĐẾN */}
            {phase === 'playing' && (
                <RigidBody type="fixed" position={[obbyPath[9].position[0], obbyPath[9].position[1] - 1, obbyPath[9].position[2] - 5]}>
                    <mesh receiveShadow>
                        <cylinderGeometry args={[4, 4, 0.5, 32]} />
                        <meshStandardMaterial color="#1e1b4b" />
                    </mesh>
                    <group position={[0, 2, 0]}>
                        <CuboidCollider args={[2, 2, 1]} sensor onIntersectionEnter={handleEndGame} />
                        <mesh><torusGeometry args={[2, 0.1, 16, 100]} /><meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={3} /></mesh>
                    </group>
                </RigidBody>
            )}

            {/* VỰC THẲM RESET (Death Zone) */}
            <RigidBody type="fixed" position={[0, -8, -25]} colliders={false}>
                <mesh><boxGeometry args={[100, 1, 100]} /><meshBasicMaterial color="#000000" transparent opacity={0} /></mesh>
            </RigidBody>

            {/* ÂM THANH KHI CHƠI */}
            {phase === 'playing' && (
                <Html><audio src="/english_audio.mp3" autoPlay loop volume={0.4} /></Html>
            )}

            {/* MÀN HÌNH CHUYỂN CẢNH MINDMAP TRƯỚC KHI VÀO GAME */}
            {phase === 'intro_mindmap' && (
                <Html center zIndexRange={[99999, 0]}>
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto' }}>
                        <img src="/mindmap_scene4.jpg" alt="Mindmap" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '10px', border: '3px solid #818cf8' }} />
                        <p style={{ color: '#fbbf24', marginTop: '20px', fontSize: '24px', fontWeight: 'bold', animation: 'blink 1.5s infinite', textShadow: '0 2px 5px #000' }}>[ NHẤN PHÍM ENTER ĐỂ BẮT ĐẦU ]</p>
                        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                    </div>
                </Html>
            )}
        </group>
    )
}