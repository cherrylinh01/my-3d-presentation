import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Text, Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { setState } from 'playroomkit'
import * as THREE from 'three'

const SCRIPT = [
    { name: "Người dẫn chuyện 😈", text: "Hahaha! Chào mừng đến với Thư Viện Ký Ức! Để mở cánh cửa tiếp theo, các ngươi phải hấp thụ hết 7749 mảnh ký ức về Thành công ở đây. Các ngươi có 1 phút... Bắt đầu!", speed: 1, chunked: false },
    { name: "NV9 😰", text: "Khoan đã! Thông tin bay nhanh thế này, nhiều số liệu biểu đồ thế này làm sao đọc từng chữ được? Mọi người tản ra tìm cách đi!", speed: 1, chunked: false },
    { name: "NV_Phòng 1 💡", text: "Đừng cố đọc từng từ (word-by-word)! Hãy để tôi trang bị cho các bạn kỹ năng: Reading Fluently: Noticing Chunks (Đọc theo cụm). Khi ta ghép các từ thành cụm có nghĩa, não bộ sẽ xử lý hình ảnh nhanh hơn!", speed: 1, chunked: false },
    { name: "NV_Phòng 1 🪄", text: "✨ [Sử dụng Kỹ năng: Noticing Chunks] ✨", speed: 0.1, chunked: true },
    { name: "NV9 😲", text: "Tuyệt vời! Chúng ta đã đọc được. Nhưng khoan, còn đống biểu đồ lằng nhằng này thì sao? Cái nào mới là thông tin đúng?", speed: 0.1, chunked: true },
    { name: "NV_Phòng 1 🧠", text: "Đó là lúc ta cần Critical Thinking Skill (Tư duy phản biện)! Không phải dữ liệu nào người khác gọi là 'thành công' cũng áp dụng cho chúng ta. Hãy phân tích logic của chúng.", speed: 0.1, chunked: true },
    { name: "Hệ thống 🌟", text: "[Mindmap đang được tổng hợp... Hãy chú ý trên không trung]", speed: 0.1, chunked: true, showKey: true }
];

// COMPONENT: Hiệu ứng chữ chớp tắt và rung rinh (Glitch)
function GlitchText({ isChunked, basePosition, ...props }) {
    const textRef = useRef();

    useFrame(() => {
        if (!textRef.current) return;

        // Chỉ bị nhiễu sóng (glitch) khi CHƯA dùng kỹ năng
        if (!isChunked) {
            // Xác suất 8% mỗi khung hình chữ sẽ bị lỗi
            if (Math.random() > 0.92) {
                textRef.current.fillOpacity = Math.random() * 0.4 + 0.2; // Chớp mờ đi
                textRef.current.position.y = basePosition[1] + (Math.random() - 0.5) * 0.4; // Giật vị trí lên xuống
            } else {
                textRef.current.fillOpacity = 1; // Rõ nét trở lại
                textRef.current.position.y = basePosition[1]; // Trở về vị trí cũ
            }
        } else {
            // Khi đã dùng kỹ năng -> Ký ức hoàn toàn ổn định và phát sáng
            textRef.current.fillOpacity = 1;
            textRef.current.position.y = basePosition[1];
        }
    });

    return <Text ref={textRef} position={basePosition} {...props} />;
}

function MindmapKeyAnimation({ onComplete }) {
    const keyRef = useRef();
    const [phase, setPhase] = useState('mindmap'); // mindmap -> linegraph -> flying
    const [texMindmap, setTexMindmap] = useState(null);
    const [texLineGraph, setTexLineGraph] = useState(null);

    useEffect(() => {
        new THREE.TextureLoader().load('/mindmap_chunks.jpg', setTexMindmap);
        new THREE.TextureLoader().load('/line_graph.jpg', setTexLineGraph);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                if (phase === 'mindmap') setPhase('linegraph');
                else if (phase === 'linegraph') setPhase('flying');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase]);

    useFrame((state) => {
        if (!keyRef.current) return;

        if (phase === 'mindmap' || phase === 'linegraph') {
            const readPos = new THREE.Vector3(0, 5, -10);
            const readScale = new THREE.Vector3(1.8, 1.8, 1.8);
            keyRef.current.position.lerp(readPos, 0.05);
            keyRef.current.scale.lerp(readScale, 0.05);
        } else if (phase === 'flying') {
            const targetPos = new THREE.Vector3(0, 3, -17);
            const targetScale = new THREE.Vector3(0.1, 0.1, 0.1);
            keyRef.current.position.lerp(targetPos, 0.03);
            keyRef.current.scale.lerp(targetScale, 0.03);
            keyRef.current.rotation.y += 0.1;

            if (keyRef.current.position.z < -16.5) onComplete();
        }
    });

    return (
        <group ref={keyRef} position={[0, 0, 0]} scale={[0, 0, 0]}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                <mesh>
                    <boxGeometry args={[10, 6, 0.2]} />
                    <meshStandardMaterial
                        color={(phase === 'mindmap' && texMindmap) || (phase === 'linegraph' && texLineGraph) ? '#ffffff' : '#fcd34d'}
                        map={phase === 'mindmap' ? texMindmap : (phase === 'linegraph' ? texLineGraph : null)}
                        emissive="#000000"
                    />
                </mesh>

                {/* DÒNG CHỮ HƯỚNG DẪN ENTER ĐỘNG */}
                <Text position={[0, -3.5, 0]} fontSize={0.4} color="#fbbf24" outlineWidth={0.02} outlineColor="#000">
                    {phase === 'mindmap' ? "[ NHẤN ENTER ĐỂ XEM BIỂU ĐỒ ]" : "[ NHẤN ENTER ĐỂ MỞ CỬA ]"}
                </Text>
            </Float>
        </group>
    );
}

export default function Scene2_Memory() {
    const vortexRef = useRef();
    const [step, setStep] = useState(0);
    const [doorOpen, setDoorOpen] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const currentScript = SCRIPT[step];

    const handleNextDialogue = () => { if (step < SCRIPT.length - 1) setStep(step + 1); };

    const triggerDoorOpen = () => {
        setDoorOpen(true);
        setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setState('currentScene', 'scene3'), 1000);
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
            { raw: "Life is a marathon, not a sprint. Don't rush to the finish line, appreciate every step.", chunk: "Life is a marathon,   |   not a sprint.   |   Don't rush   |   to the finish line,   |   appreciate every step." },
            { raw: "Success is not a destination, but a journey. Embrace the process and find joy in the small victories.", chunk: "Success is not   |   a destination,   |   but a journey.   |   Embrace the process   |   and find joy   |   in the small victories." },
            { raw: "The success you dream of may not feel like success when you finally get it.", chunk: "The success you dream of   |   may not feel like success   |   when you finally get it." },
            { raw: "Enjoy the journey. You are the true success.", chunk: "Enjoy the journey.   |   You are the true success." }
        ];

        for (let i = 0; i < sentences.length; i++) {
            nodes.push({ id: i, rawText: sentences[i].raw, chunkText: sentences[i].chunk, radius: 20, height: (sentences.length / 2 - i) * 1.5 + 5, baseSpeed: (i % 2 === 0 ? 1 : -1) * 0.15 });
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

    return (
        <group>
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
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
                                    key={idx}
                                    basePosition={[x, 0, z]}
                                    rotation={[0, angle + Math.PI, 0]}
                                    curveRadius={node.radius}
                                    fontSize={0.8}
                                    color={currentScript.chunked ? "#fbbf24" : "#93c5fd"}
                                    textAlign="center"
                                    maxWidth={100}
                                    anchorX="center"
                                    fontWeight={currentScript.chunked ? "bold" : "normal"}
                                    isChunked={currentScript.chunked} // Truyền trạng thái kỹ năng vào
                                >
                                    {currentScript.chunked ? node.chunkText : node.rawText}
                                </GlitchText>
                            )
                        })}
                    </group>
                ))}
            </group>

            {currentScript.showKey && !doorOpen && <MindmapKeyAnimation onComplete={triggerDoorOpen} />}

            <RigidBody type="fixed" colliders={false} position={[0, 3, -18]}>
                <mesh position={[0, 0, 0.1]}><boxGeometry args={[5, 9.5, 0.6]} /><meshStandardMaterial color={doorOpen ? "#ffffff" : "#60a5fa"} emissive={doorOpen ? "#ffffff" : "#3b82f6"} emissiveIntensity={doorOpen ? 5 : 1} /></mesh>
                <mesh position={[0, 0, 0]}><boxGeometry args={[6, 10, 0.5]} /><meshStandardMaterial color="#334155" /></mesh>
            </RigidBody>

            {/* BẢNG GIAO TIẾP ĐÃ ĐƯỢC DỜI LẠI GẦN CỬA (z = -12) */}
            <Html center position={[0, 4, -12]} zIndexRange={[100, 0]}>
                <div style={{ width: '800px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100%', background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #3b82f6',
                        padding: '20px 30px', borderRadius: '10px', color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '22px' }}>{currentScript.name}</h3>
                        <p style={{ margin: '0', fontSize: '18px', lineHeight: '1.6', fontStyle: currentScript.chunked && currentScript.name.includes("Hệ thống") ? "italic" : "normal" }}>{currentScript.text}</p>
                        {!currentScript.showKey && (
                            <button onClick={handleNextDialogue} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', float: 'right', fontWeight: 'bold' }}>Tiếp tục ▼</button>
                        )}
                    </div>
                </div>
            </Html>

            {fadeOut && (
                <Html fullscreen zIndexRange={[999, 0]}>
                    <div style={{ width: '100vw', height: '100vh', background: 'black', animation: 'fadeIn 1s forwards' }}><style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style></div>
                </Html>
            )}
        </group>
    )
}