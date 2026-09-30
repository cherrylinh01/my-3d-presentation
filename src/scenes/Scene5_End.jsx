// src/scenes/Scene5_End.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Text, Environment, Float, Stars, Html } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMultiplayerState } from 'playroomkit'

// CẤU HÌNH BẢNG MÀU PHÁO HOA RỰC RỠ (Neon)
const FIREWORK_COLORS = ['#ff0000', '#00ff00', '#4287f5', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff4500', '#39ff14'];

// 1. COMPONENT XỬ LÝ ĐỘNG LỰC HỌC CỦA 1 QUẢ PHÁO HOA (Bay lên -> Nổ bung -> Rơi xuống)
function Firework({ data, onComplete }) {
    const [phase, setPhase] = useState('launch'); // Các pha: 'launch' (Bay lên) -> 'explode' (Nổ tung)
    const ref = useRef();
    const particlesRef = useRef();

    const pos = useRef(new THREE.Vector3(data.startX, -5, data.startZ)); // Vị trí bắn từ dưới đất lên
    const vel = useRef(new THREE.Vector3(0, data.launchSpeed, 0)); // Vận tốc bay vút lên cao

    const particleCount = 250; // Số lượng mảnh vụn khi nổ
    const pPositions = useMemo(() => new Float32Array(particleCount * 3), []);
    const pVelocities = useMemo(() => new Float32Array(particleCount * 3), []);

    // Khởi tạo vận tốc tỏa tròn (Spherical Explosion) cho các hạt
    useEffect(() => {
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);
            const speed = 15 + Math.random() * 25; // Sức nổ bùng ra cực mạnh

            pVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
            pVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            pVelocities[i * 3 + 2] = speed * Math.cos(phi);
        }
    }, []);

    useFrame((state, delta) => {
        if (phase === 'launch') {
            // Cập nhật vị trí vệt sáng bay lên
            pos.current.addScaledVector(vel.current, delta);
            vel.current.y -= 15 * delta; // Lực hút trái đất kéo pháo hoa chậm lại khi lên đỉnh

            if (ref.current) {
                ref.current.position.copy(pos.current);
            }

            // Khi vận tốc hướng lên gần bằng 0 (Đạt đỉnh) -> Kích Nổ!
            if (vel.current.y <= 2) {
                setPhase('explode');
                for (let i = 0; i < particleCount; i++) {
                    pPositions[i * 3] = pos.current.x;
                    pPositions[i * 3 + 1] = pos.current.y;
                    pPositions[i * 3 + 2] = pos.current.z;
                }
            }
        } else if (phase === 'explode') {
            if (!particlesRef.current) return;

            const positions = particlesRef.current.geometry.attributes.position.array;

            for (let i = 0; i < particleCount; i++) {
                // Di chuyển hạt theo vận tốc
                positions[i * 3] += pVelocities[i * 3] * delta;
                positions[i * 3 + 1] += pVelocities[i * 3 + 1] * delta;
                positions[i * 3 + 2] += pVelocities[i * 3 + 2] * delta;

                // VẬT LÝ QUAN TRỌNG: Lực cản không khí làm hạt phanh gấp lại tạo hình bông hoa
                pVelocities[i * 3] *= 0.92;
                pVelocities[i * 3 + 1] *= 0.92;
                pVelocities[i * 3 + 2] *= 0.92;

                // VẬT LÝ QUAN TRỌNG: Trọng lực kéo các hạt rơi lả tả xuống
                pVelocities[i * 3 + 1] -= 12 * delta;
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true;
            // Làm mờ dần vụn pháo hoa trong không khí
            particlesRef.current.material.opacity -= delta * 0.45;

            // Khi mờ hẳn -> Gỡ bỏ khỏi hệ thống để chống giật lag máy
            if (particlesRef.current.material.opacity <= 0) {
                onComplete(data.id);
            }
        }
    });

    if (phase === 'launch') {
        return (
            <mesh ref={ref}>
                {/* Vệt sáng đuôi pháo hoa lao lên */}
                <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
                <meshBasicMaterial color={data.color} />
                <pointLight color={data.color} intensity={2} distance={15} />
            </mesh>
        );
    }

    if (phase === 'explode') {
        return (
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={pPositions} itemSize={3} />
                </bufferGeometry>
                {/* Chế độ AdditiveBlending giúp vụn pháo hoa phát sáng rực rỡ như đèn Neon */}
                <pointsMaterial
                    size={1.2}
                    color={data.color}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        );
    }

    return null;
}

// 2. HỆ THỐNG ĐIỀU KHIỂN BẮN PHÁO HOA LIÊN TỤC
function FireworksSystem({ isEnabled }) {
    const [fireworks, setFireworks] = useState([]);

    useEffect(() => {
        if (!isEnabled) return;

        // Bắn liên thanh mỗi 250ms (4 quả 1 giây)
        const interval = setInterval(() => {
            setFireworks(prev => {
                if (prev.length > 25) return prev; // Giới hạn số lượng trên bầu trời để mượt game
                return [...prev, {
                    id: Math.random().toString(),
                    startX: (Math.random() - 0.5) * 100, // Phủ kín chiều ngang
                    startZ: -10 - Math.random() * 50,    // Bắn đằng sau lưng nhân vật
                    launchSpeed: 35 + Math.random() * 20, // Độ cao ngẫu nhiên
                    color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
                }];
            });
        }, 250);

        return () => clearInterval(interval);
    }, [isEnabled]);

    const removeFirework = (id) => {
        setFireworks(prev => prev.filter(fw => fw.id !== id));
    };

    return (
        <group>
            {fireworks.map(fw => (
                <Firework key={fw.id} data={fw} onComplete={removeFirework} />
            ))}
        </group>
    );
}

// 3. MÀN HÌNH CHÍNH SCENE 5
export default function Scene5_End() {
    const [score] = useMultiplayerState('scene3_score', 0);
    const [showFireworks, setShowFireworks] = useMultiplayerState('scene5_fireworks', false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                setShowFireworks(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <group>
            <color attach="background" args={['#020617']} />
            <Environment preset="night" />
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 20, 0]} intensity={5} angle={0.8} penumbra={0.5} color="#fef08a" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />

            {/* HỆ THỐNG PHÁO HOA ĐƯỢC KÍCH HOẠT KHI NHẤN ENTER */}
            <FireworksSystem isEnabled={showFireworks} />

            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[20, 20, 1, 64]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[14, 15, 64]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[8, 8.5, 64]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} side={THREE.DoubleSide} />
                </mesh>
            </RigidBody>

            <Float speed={2} floatIntensity={1} rotationIntensity={1}>
                <mesh position={[0, 5, -8]} castShadow>
                    <octahedronGeometry args={[2.5, 0]} />
                    <meshPhysicalMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={1} roughness={0} metalness={1} transmission={0.5} />
                </mesh>
            </Float>

            <Float speed={3} floatIntensity={0.5} rotationIntensity={0.1}>
                <group position={[0, 9.5, -8]}>
                    <Text position={[0, 1.2, 0]} fontSize={0.8} color="#fbbf24" outlineWidth={0.03} outlineColor="#000">
                        FINAL TEAM SCORE
                    </Text>
                    <Text position={[0, 0, 0]} fontSize={3} fontWeight="bold" color={score > 0 ? "#4ade80" : "#f87171"} outlineWidth={0.05} outlineColor="#000">
                        {score}
                    </Text>
                </group>
            </Float>

            <Float speed={1.5} floatIntensity={0.2}>
                <Text position={[0, 13, -12]} fontSize={1} color="#ffffff" maxWidth={20} textAlign="center" outlineWidth={0.02} outlineColor="#000" fontWeight="bold">
                    "The success you dream of may not feel like success when you finally get it."
                </Text>
                <Text position={[0, 11.5, -12]} fontSize={0.6} color="#38bdf8" outlineWidth={0.02} outlineColor="#000" fontWeight="bold">
                    Enjoy the journey. You are the true success.
                </Text>
            </Float>

            {/* AUDIO TIẾNG PHÁO HOA NỔ (Nếu bạn có file firework_sound.mp3) */}
            {showFireworks && (
                <Html>
                    <audio src="/firework_sound.mp3" autoPlay loop volume={0.5} />
                </Html>
            )}
        </group>
    )
}