import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Text, Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useMultiplayerState, isHost } from 'playroomkit'

const SCRIPT = [
    { name: "Narrator 😈", text: "Hahaha! Welcome to the Memory Library! To open the next door, you must absorb all 6767 memory pieces of Success here. You have 1 minute... Starting now!!", speed: 1, chunked: false },
    { name: "Main 😰", text: "Wait! The information is flying so fast, there are so many charts and numbers, how can we read every word? Everyone spread out and find a way!", speed: 1, chunked: false },
    { name: "Supporter 💡", text: "Don't try to read word-by-word! Let me equip you with a new skill: Reading Fluently: Noticing Chunks. When we group words into meaningful chunks, our brains will process the language faster!", speed: 1, chunked: false },
    { name: "Supporter 🪄", text: "✨ [Noticing Chunks] ✨", speed: 0.1, chunked: true },
    { name: "System 🌟", text: "[Mindmap: Reading in Chunks is displayed. Press ENTER to view Line Graph]", speed: 0.1, chunked: true, showBoard: 'mindmap' },
    { name: "System 🌟", text: "[Line Graph: Happiness vs. Income is displayed. Press ENTER to continue]", speed: 0.1, chunked: true, showBoard: 'linegraph' },
    { name: "Main 😲", text: "Great! We can read it. But wait, what about these complicated charts? Which information is correct?", speed: 0.1, chunked: true },
    { name: "Supporter 🧠", text: "Don't worry, this is exactly where we need our Critical Thinking Skill!", speed: 0.1, chunked: true },
    { name: "System 🌟", text: "[Let's go here ... Attraction!]", speed: 0.1, chunked: true, showKey: true }
];

function GlitchText({ isChunked, basePosition, ...props }) {
    const textRef = useRef();

    useFrame(() => {
        if (!textRef.current) return;
        if (!isChunked) {
            if (Math.random() > 0.92) {
                textRef.current.fillOpacity = Math.random() * 0.4 + 0.2;
                textRef.current.position.y = basePosition[1] + (Math.random() - 0.5) * 0.4;
            } else {
                textRef.current.fillOpacity = 1;
                textRef.current.position.y = basePosition[1];
            }
        } else {
            textRef.current.fillOpacity = 1;
            textRef.current.position.y = basePosition[1];
        }
    });

    return <Text ref={textRef} position={basePosition} {...props} />;
}

function MindmapKeyAnimation({ onComplete }) {
    const keyRef = useRef();

    useFrame((state) => {
        if (!keyRef.current) return;
        const targetPos = new THREE.Vector3(0, 3, -17);
        const targetScale = new THREE.Vector3(0.1, 0.1, 0.1);

        keyRef.current.position.lerp(targetPos, 0.03);
        keyRef.current.scale.lerp(targetScale, 0.03);
        keyRef.current.rotation.y += 0.1;

        if (keyRef.current.position.z < -16.5) onComplete();
    });

    return (
        <group ref={keyRef} position={[0, 5, -8]}>
            <mesh>
                <boxGeometry args={[4, 2, 0.2]} />
                <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

export default function Scene2_Memory() {
    const vortexRef = useRef();
    const [currentScene, setCurrentScene] = useMultiplayerState('globalScene', 'scene1');
    const [step, setStep] = useMultiplayerState('dialogueStep_Scene2', 0);
    const [doorOpen, setDoorOpen] = useMultiplayerState('doorOpen_Scene2', false);
    const [fadeOut, setFadeOut] = useState(false);
    const [texMindmap, setTexMindmap] = useState(null);
    const [texLineGraph, setTexLineGraph] = useState(null);
    const [activeBoard, setActiveBoard] = useState(null);

    // TÍNH NĂNG MỚI: State để ẩn/hiện hộp thoại
    const [isMinimized, setIsMinimized] = useState(false);

    const currentScript = SCRIPT[step];

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('teleportPlayer', { detail: { x: 0, y: 5, z: 5 } }));
    }, []);

    // TÍNH NĂNG MỚI: Khi chuyển thoại mới, tự động mở to hộp thoại ra để người chơi đọc
    useEffect(() => {
        setIsMinimized(false);
    }, [step]);

    useEffect(() => {
        new THREE.TextureLoader().load('/mindmap_chunks.jpg', setTexMindmap);
        new THREE.TextureLoader().load('/line_graph.jpg', setTexLineGraph);
    }, []);

    useEffect(() => {
        if (currentScript.showBoard) {
            setActiveBoard(currentScript.showBoard);
        }
    }, [step, currentScript]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && isHost()) {
                setStep((prev) => {
                    if (prev < SCRIPT.length - 1 && !SCRIPT[prev].showKey) return prev + 1;
                    return prev;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNextDialogue = () => {
        if (isHost() && step < SCRIPT.length - 1) setStep(step + 1);
    };

    const triggerDoorOpen = () => {
        setDoorOpen(true);
        setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                if (isHost()) setCurrentScene('scene3');
            }, 1000);
        }, 1500);
    };

    const dataVortex = useMemo(() => {
        const nodes = [];
        const sentences = [
            { raw: "What does it mean to succeed? Is it proving that you're the best, or simply enjoying the moment?", chunk: "What does it mean   |   to succeed?   |   Is it proving   |   that you're the best,   |   or simply enjoying   |   the moment?" },
            { raw: "Success is not about the destination, but the journey itself.", chunk: "Success is not   |   about the destination,   |   but the journey itself." },
            { raw: "Winning an Olympic medal: Who is more successful? The silver medalist or the bronze medalist?", chunk: "Winning an Olympic medal:   |   Who is more successful?   |   The silver medalist   |   or the bronze medalist?" },
            { raw: "Bronze winners are happier, while silver winners feel they lost the gold.", chunk: "Bronze winners   |   are happier,   |   while silver winners feel   |   they lost the gold." },
            { raw: "Happiness is a choice. Money doesn't always buy joy, and financial success has limits.", chunk: "Happiness   |   is a choice.   |   Money doesn't always buy joy,   |   and financial success   |   has limits." },
            { raw: "Enjoy the journey. That is true success. Take a deep breath and look around you.", chunk: "Enjoy the journey.   |   That is true success.   |   Take a deep breath   |   and look around you." },
            { raw: "Life is a marathon, not a sprint. Don't rush to the finish line, appreciate every step.", chunk: "Life is a marathon,   |   not a sprint.   |   Don't rush   |   to the finish line,   |   appreciate every step." }
        ];
        // Nhân bản data để vòng xoáy dày đặc hơn
        for (let i = 0; i < sentences.length * 2; i++) {
            nodes.push({ id: i, rawText: sentences[i % sentences.length].raw, chunkText: sentences[i % sentences.length].chunk, radius: 20, height: (sentences.length - (i % sentences.length)) * 1.5 + 5, baseSpeed: (i % 2 === 0 ? 1 : -1) * 0.15 });
        }
        return nodes;
    }, []);

    useFrame((state, delta) => {
        if (vortexRef.current) {
            vortexRef.current.children.forEach((child, index) => {
                child.rotation.y += dataVortex[index].baseSpeed * currentScript.speed * delta * 10;
            });
        }
    });

    const faceAngles = currentScript.chunked ? [0, Math.PI] : [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    const dialogPosition = activeBoard ? [0, 1.8, -9.5] : [0, 4, -12];
    const isBrightRoom = step >= 4;

    return (
        <group>
            <color attach="background" args={[isBrightRoom ? '#1e293b' : '#050505']} />
            <ambientLight intensity={isBrightRoom ? 2.5 : 0.5} />
            <directionalLight position={[10, 20, 10]} intensity={isBrightRoom ? 1.5 : 0} />
            <pointLight position={[0, 5, 0]} intensity={3} color={currentScript.chunked ? "#fbbf24" : "#3b82f6"} distance={50} />

            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh><boxGeometry args={[200, 1, 200]} /><meshStandardMaterial color="#0f172a" /></mesh>
            </RigidBody>

            <group ref={vortexRef}>
                {dataVortex.map((node) => (
                    <group key={node.id} position={[0, node.height, 0]}>
                        {faceAngles.map((angle, idx) => {
                            const x = Math.sin(angle) * node.radius;
                            const z = Math.cos(angle) * node.radius;
                            return (
                                <GlitchText
                                    key={idx} basePosition={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}
                                    curveRadius={node.radius} fontSize={0.8} color={currentScript.chunked ? "#fbbf24" : "#93c5fd"}
                                    textAlign="center" maxWidth={100} anchorX="center" fontWeight={currentScript.chunked ? "bold" : "normal"}
                                    isChunked={currentScript.chunked}
                                >
                                    {currentScript.chunked ? node.chunkText : node.rawText}
                                </GlitchText>
                            )
                        })}
                    </group>
                ))}
            </group>

            {activeBoard && (
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                    <mesh position={[0, 6.5, -10]}>
                        <boxGeometry args={[14, 8.4, 0.2]} />
                        <meshStandardMaterial color="#ffffff" map={activeBoard === 'mindmap' ? texMindmap : texLineGraph} emissive="#111111" />
                    </mesh>
                </Float>
            )}

            {currentScript.showKey && !doorOpen && <MindmapKeyAnimation onComplete={triggerDoorOpen} />}

            <RigidBody type="fixed" colliders={false} position={[0, 3, -18]}>
                <mesh position={[0, 0, 0.1]}><boxGeometry args={[5, 9.5, 0.6]} /><meshStandardMaterial color={doorOpen ? "#ffffff" : "#60a5fa"} emissive={doorOpen ? "#ffffff" : "#3b82f6"} emissiveIntensity={doorOpen ? 5 : 1} /></mesh>
                <mesh position={[0, 0, 0]}><boxGeometry args={[6, 10, 0.5]} /><meshStandardMaterial color="#334155" /></mesh>
            </RigidBody>

            {/* HỘP THOẠI CÓ TÍNH NĂNG THU NHỎ */}
            <Html center position={dialogPosition} zIndexRange={[100, 0]}>
                <div style={{ width: '800px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100%', background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #3b82f6',
                        padding: '20px 30px', borderRadius: '10px', color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'all 0.3s ease'
                    }}>
                        {/* Header chứa Tên nhân vật và Nút Thu nhỏ/Phóng to */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? '0' : '15px' }}>
                            <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '22px' }}>{currentScript.name}</h3>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '5px', color: 'white', cursor: 'pointer', padding: '5px 12px',
                                    fontSize: '14px', fontWeight: 'bold'
                                }}
                            >
                                {isMinimized ? '➕ Hiện' : '➖ Thu nhỏ'}
                            </button>
                        </div>

                        {/* Nội dung bên trong (Sẽ bị ẩn nếu bấm thu nhỏ) */}
                        {!isMinimized && (
                            <>
                                <p style={{ margin: '0', fontSize: '18px', lineHeight: '1.6', fontStyle: currentScript.chunked && currentScript.name.includes("System") ? "italic" : "normal" }}>
                                    {currentScript.text}
                                </p>
                                {!currentScript.showKey && (
                                    <button onClick={handleNextDialogue} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', float: 'right', fontWeight: 'bold' }}>
                                        Tiếp tục ▼
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Html>

            <Html>
                <audio src="/library_whispers.mp3" autoPlay loop volume={0.3} />
            </Html>

            {fadeOut && (
                <Html fullscreen zIndexRange={[999, 0]}>
                    <div style={{ width: '100vw', height: '100vh', background: 'black', animation: 'fadeIn 1s forwards' }}><style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style></div>
                </Html>
            )}
        </group>
    )
}