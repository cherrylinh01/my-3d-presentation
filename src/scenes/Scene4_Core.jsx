import React, { useState, useEffect, useRef } from 'react';
import { useMultiplayerState, isHost, setState } from 'playroomkit';
import { Html, Text, Float, Stars, Sparkles } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// KỊCH BẢN 9 CHẶNG NHẢY ĐÃ CẬP NHẬT TEXT DÀI
const OBBY_DATA = [
    { id: 0, isObby: false, audio: "1.mp3", ans1: "31 Years Working", ans2: "10 Years Working", correct: 1, type1: "none", type2: "updown" },
    { id: 1, isObby: false, audio: "2.mp3", ans1: "Study Geology", ans2: "Study Biology", correct: 2, type1: "leftright", type2: "none" },
    { id: 2, isObby: true, audio: null, type: "leftright" }, // Thử thách kỹ năng, không audio
    { id: 3, isObby: false, audio: "3.mp3", ans1: "Tour Guide", ans2: "Museum Docent", correct: 1, type1: "updown", type2: "none" },
    { id: 4, isObby: false, audio: "4.mp3", ans1: "Vlogger", ans2: "Blogger", correct: 2, type1: "none", type2: "leftright" },
    { id: 5, isObby: true, audio: null, type: "updown" },    // Thử thách kỹ năng, không audio
    { id: 6, isObby: false, audio: "5.mp3", ans1: "Science Journalist", ans2: "Health Reporter", correct: 1, type1: "leftright", type2: "updown" },
    { id: 7, isObby: false, audio: "6.mp3", ans1: "Radio Writer", ans2: "Television Writer", correct: 1, type1: "updown", type2: "none" },
    { id: 8, isObby: true, audio: null, type: "leftright" }  // Thử thách kỹ năng, không audio
];

// COMPONENT BỤC NHẢY
function ObbyPlatform({ position, type, text, isCorrect, onCorrect, offset, currentStage }) {
    const ref = useRef();
    const [isFakeTouched, setIsFakeTouched] = useState(false);

    useEffect(() => {
        if (currentStage === 0) setIsFakeTouched(false);
    }, [currentStage]);

    useFrame((state) => {
        if (type === 'none' || !ref.current) return;
        const t = state.clock.getElapsedTime() + offset;

        if (type === 'updown') {
            ref.current.setNextKinematicTranslation({ x: position[0], y: position[1] + Math.sin(t * 2) * 1.2, z: position[2] });
        } else if (type === 'leftright') {
            ref.current.setNextKinematicTranslation({ x: position[0] + Math.sin(t * 1.5) * 2.2, y: position[1], z: position[2] });
        }
    });

    const handleFakeTouch = () => {
        if (!isCorrect) setIsFakeTouched(true);
    };

    return (
        <RigidBody
            ref={ref}
            type={type === 'none' ? 'fixed' : 'kinematicPosition'}
            position={position}
            colliders={isCorrect ? "hull" : false}
        >
            <mesh receiveShadow castShadow>
                <cylinderGeometry args={[2.0, 1.8, 0.5, 32]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#7e22ce"
                    emissiveIntensity={0.8}
                    transparent={true}
                    opacity={isFakeTouched ? 0.2 : 1}
                />
            </mesh>
            <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.8, 2.0, 32]} />
                <meshBasicMaterial color="#d8b4fe" transparent opacity={isFakeTouched ? 0.2 : 1} side={THREE.DoubleSide} />
            </mesh>

            {/* CHỮ ĐƯỢC ÉP XUỐNG DÒNG (maxWidth) VÀ CĂN GIỮA (textAlign) */}
            {text && (
                <Text
                    position={[0, 0.26, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.65}
                    color="#ffffff"
                    outlineWidth={0.04}
                    outlineColor="#000"
                    anchorY="middle"
                    anchorX="center"
                    fontWeight="bold"
                    fillOpacity={isFakeTouched ? 0.2 : 1}
                    maxWidth={3.2}
                    textAlign="center"
                    lineHeight={1.2}
                >
                    {text}
                </Text>
            )}

            {isCorrect && (
                <CuboidCollider args={[1.5, 0.2, 1.5]} position={[0, 0.4, 0]} sensor onIntersectionEnter={onCorrect} />
            )}
            {!isCorrect && (
                <CuboidCollider args={[1.5, 0.2, 1.5]} position={[0, 0.4, 0]} sensor onIntersectionEnter={handleFakeTouch} />
            )}
        </RigidBody>
    );
}

export default function Scene4_Core() {
    const [phase, setPhase] = useMultiplayerState('scene4_phase', 'presentation');
    const [currentStage, setCurrentStage] = useMultiplayerState('scene4_stage', 0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && isHost() && phase === 'presentation') {
                setPhase('playing');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase]);

    const handleFail = () => {
        window.dispatchEvent(new CustomEvent('teleportPlayer', { detail: { x: 0, y: 5, z: 0 } }));
        setCurrentStage(0);
    };

    const handleCorrect = (stageIdx) => {
        if (stageIdx === currentStage) {
            setCurrentStage(stageIdx + 1);
        }
    };

    const handleVictory = () => {
        setState('globalScene', 'scene5');
    };

    return (
        <group>
            <ambientLight intensity={1.5} />
            <directionalLight castShadow position={[10, 20, 10]} intensity={2} color="#e879f9" />
            <pointLight position={[0, 10, -40]} intensity={5} color="#38bdf8" distance={100} />
            <color attach="background" args={['#0f172a']} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
            <Sparkles count={500} scale={100} size={6} speed={0.4} color="#fbcfe8" opacity={0.5} />

            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[6, 5, 1, 64]} />
                    <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[4.5, 5, 64]} />
                    <meshBasicMaterial color="#93c5fd" side={THREE.DoubleSide} />
                </mesh>
                <Text position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} color="white" fontWeight="900" outlineWidth={0.1} outlineColor="#1e3a8a">
                    START
                </Text>
            </RigidBody>

            {OBBY_DATA.map((stage, idx) => {
                const zPos = -8 - (idx * 6.5);

                if (stage.isObby) {
                    return (
                        <group key={stage.id}>
                            <ObbyPlatform
                                position={[0, 0, zPos]} type={stage.type} text="JUMP!"
                                isCorrect={true} offset={idx} currentStage={currentStage}
                                onCorrect={() => handleCorrect(idx)}
                            />
                        </group>
                    )
                }

                return (
                    <group key={stage.id}>
                        <ObbyPlatform
                            position={[-2.2, 0, zPos]} type={stage.type1} text={stage.ans1}
                            isCorrect={stage.correct === 1} offset={idx} currentStage={currentStage}
                            onCorrect={() => handleCorrect(idx)}
                        />
                        <ObbyPlatform
                            position={[2.2, 0, zPos]} type={stage.type2} text={stage.ans2}
                            isCorrect={stage.correct === 2} offset={idx + 0.5} currentStage={currentStage}
                            onCorrect={() => handleCorrect(idx)}
                        />
                    </group>
                )
            })}

            <RigidBody type="fixed" position={[0, -0.5, -68]}>
                <mesh receiveShadow>
                    <cylinderGeometry args={[8, 7, 1, 64]} />
                    <meshStandardMaterial color="#10b981" emissive="#047857" emissiveIntensity={0.6} roughness={0.2} metalness={0.5} />
                </mesh>

                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[5, 0.2, 16, 100]} />
                        <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[4, 0.2, 16, 100]} />
                        <meshStandardMaterial color="#6ee7b7" emissive="#34d399" emissiveIntensity={2} />
                    </mesh>
                </Float>

                <Text position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.5} color="white" fontWeight="900" outlineWidth={0.1} outlineColor="#064e3b">
                    FINISH
                </Text>
                <CuboidCollider args={[8, 5, 8]} position={[0, 5, 0]} sensor onIntersectionEnter={handleVictory} />
            </RigidBody>

            <RigidBody type="fixed" position={[0, -8, -35]}>
                <CuboidCollider args={[50, 1, 100]} sensor onIntersectionEnter={handleFail} />
            </RigidBody>

            {phase === 'presentation' && (
                <Html position={[0, 4, -5]} center zIndexRange={[99999, 0]}>
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        pointerEvents: 'auto'
                    }}>
                        <img src="/mindmap_scene4.jpg" alt="Mindmap Scene 4" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }} />
                        <p style={{ color: '#fff', marginTop: '20px', fontSize: '24px', fontWeight: 'bold', animation: 'blink 1.5s infinite', textShadow: '0 0 10px #a855f7' }}>
                            [ PRESS ENTER TO START OBBY ]
                        </p>
                        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                    </div>
                </Html>
            )}

            {phase === 'playing' && currentStage < OBBY_DATA.length && OBBY_DATA[currentStage].audio && (
                <Html>
                    <audio key={currentStage} src={`/${OBBY_DATA[currentStage].audio}`} autoPlay loop volume={0.6} />
                </Html>
            )}
        </group>
    );
}