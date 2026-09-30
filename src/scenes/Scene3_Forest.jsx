import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Text, Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import DynamicModel from '../components/3d/DynamicModel'

// Import useMultiplayerState và isHost từ playroomkit
import { setState, useMultiplayerState, isHost } from 'playroomkit'

const MONSTER_DATA = [
    { id: 1, text: "I have went to Paris last year.", isCorrect: false },
    { id: 2, text: "I went to Paris last year.", isCorrect: true },
    { id: 3, text: "She must to go now.", isCorrect: false },
    { id: 4, text: "She has to go now.", isCorrect: true },
    { id: 5, text: "You don't have to smoke here.", isCorrect: false },
    { id: 6, text: "You mustn't smoke here.", isCorrect: true },
    { id: 7, text: "He has finished work yesterday.", isCorrect: false },
    { id: 8, text: "I have known him for 5 years.", isCorrect: true },
    { id: 9, text: "We didn't went to the cinema.", isCorrect: false },
    { id: 10, text: "She didn't go to the cinema.", isCorrect: true },
    { id: 11, text: "I have went to Paris last year.", isCorrect: false },
    { id: 12, text: "I went to Paris last year.", isCorrect: true },
    { id: 13, text: "She must to go now.", isCorrect: false },
    { id: 14, text: "She has to go now.", isCorrect: true },
    { id: 15, text: "You don't have to smoke here.", isCorrect: false },
    { id: 16, text: "You mustn't smoke here.", isCorrect: true },
    { id: 17, text: "She has learned how to code in Python.", isCorrect: true },
    { id: 18, text: "I've lived in Ho Chi Minh City for five years.", isCorrect: true },
    { id: 19, text: "I have went to the store.", isCorrect: false },
    { id: 20, text: "He must to finish his homework.", isCorrect: false },
    { id: 21, text: "You don't have to wear a helmet.", isCorrect: false },
    { id: 22, text: "I've practiced presentation skills a lot ... and now, I feel much more confident.", isCorrect: true },
    { id: 23, text: "I have went to the store.", isCorrect: false },
    { id: 24, text: "He must to finish his homework.", isCorrect: false },
    { id: 25, text: "You don't have to wear a helmet.", isCorrect: false },
    { id: 26, text: "I decided to study technology at university.", isCorrect: true },
    { id: 27, text: "I have went to the store.", isCorrect: false },
    { id: 28, text: "He must to finish his homework.", isCorrect: false },
    { id: 29, text: "You don't have to wear a helmet.", isCorrect: false },
    { id: 30, text: "She bought a new notebook last week.", isCorrect: true }
];

function Monster({ data, onHit }) {
    const ref = useRef();
    const [status, setStatus] = useState('alive');

    const { startX, startZ, speed, targetX, wobbleOffset } = data;

    useEffect(() => {
        if (ref.current) {
            ref.current.position.set(startX, 1, startZ);
        }
    }, [startX, startZ]);

    useFrame((state, delta) => {
        if (status === 'alive' && ref.current) {
            ref.current.position.z += speed * delta;
            const time = state.clock.getElapsedTime();
            const wobble = Math.sin(time * 2 + wobbleOffset) * 1.5;
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX + wobble, 0.01);

            if (ref.current.position.z > 15) {
                ref.current.position.set(startX, 1, startZ);
            }
        }
    });

    const handleClick = () => {
        if (status !== 'alive') return;
        if (!data.isCorrect) {
            setStatus('exploded');
            onHit(10);
        } else {
            setStatus('wrong');
            onHit(-5);
            setTimeout(() => setStatus('alive'), 1000);
        }
    };

    if (status === 'exploded') {
        return (
            <group position={ref.current ? ref.current.position : [0, 0, 0]}>
                <Sparkles count={50} scale={2} size={6} speed={2} color="#facc15" />
            </group>
        );
    }

    return (
        <group ref={ref} position={[startX, 1, startZ]} onClick={handleClick} cursor="pointer">
            <mesh castShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color={status === 'wrong' ? '#ef4444' : '#16a34a'} roughness={0.3} metalness={0.2} />
            </mesh>
            <Text position={[0, 1.8, 0]} fontSize={0.6} color="white" outlineWidth={0.05} outlineColor="black" anchorY="bottom">
                {data.text}
            </Text>
        </group>
    );
}

export default function Scene3_Forest() {
    const [phase, setPhase] = useMultiplayerState('scene3_phase', 'intro');
    const [score, setScore] = useMultiplayerState('scene3_score', 0);
    const [timeLeft, setTimeLeft] = useMultiplayerState('scene3_time', 120);
    const [activeMonsters, setActiveMonsters] = useMultiplayerState('scene3_monsters', []);
    const [spawnCount, setSpawnCount] = useMultiplayerState('scene3_spawnCount', 0);

    // Dùng Refs để giữ giá trị mới nhất mà không gây lỗi mạng (Fix lỗi Crash ngầm)
    const activeMonstersRef = useRef(activeMonsters);
    const scoreRef = useRef(score);
    useEffect(() => { activeMonstersRef.current = activeMonsters; }, [activeMonsters]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // CHỈ TRƯỞNG PHÒNG (HOST) MỚI CÓ QUYỀN SINH QUÁI
    useEffect(() => {
        if (isHost() && phase === 'playing' && spawnCount < MONSTER_DATA.length) {
            const timer = setTimeout(() => {
                const newMonster = {
                    ...MONSTER_DATA[spawnCount],
                    startX: (Math.random() - 0.5) * 40,
                    startZ: -40 - Math.random() * 30,
                    speed: 3 + Math.random() * 3,
                    targetX: (Math.random() - 0.5) * 20,
                    wobbleOffset: Math.random() * Math.PI * 2,
                };
                // Dùng giá trị trực tiếp thay vì hàm callback prev => ...
                setActiveMonsters([...activeMonstersRef.current, newMonster]);
                setSpawnCount(spawnCount + 1);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [phase, spawnCount]);

    // ĐỒNG BỘ PHÍM ENTER ĐỂ CHUYỂN SCENE CHO CẢ PHÒNG
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (phase === 'transition_to_4' && e.key === 'Enter') {
                setState('globalScene', 'scene4');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase]);

    // ĐẾM THỜI GIAN: Đổi setInterval thành setTimeout để tránh kẹt trạng thái
    useEffect(() => {
        if (isHost() && phase === 'playing' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isHost() && phase === 'playing' && timeLeft <= 0) {
            setPhase('gameover');
        }
    }, [phase, timeLeft]);

    // CHỈ TRƯỞNG PHÒNG KIỂM TRA ĐIỀU KIỆN CHIẾN THẮNG
    useEffect(() => {
        if (isHost() && phase === 'playing' && spawnCount === MONSTER_DATA.length && activeMonsters.filter(m => !m.isCorrect).length === 0) {
            setPhase('victory');
        }
    }, [phase, spawnCount, activeMonsters]);

    // Danh sách cây khủng của bạn
    const treeModels = ['plant_bush.glb', 'plant_bushLarge.glb', 'tree_oak_dark.glb', 'tree_blocks_dark.glb', 'tree_cone_dark.glb', 'tree_default_dark.glb', 'tree_detailed_dark.glb', 'tree_fat_darkh.glb', 'tree_palm.glb', 'tree_palmBend.glb', 'tree_palmDetailedShort.glb', 'tree_palmDetailedTall.glb', 'tree_palmShort.glb', 'tree_palmTall.glb', 'tree_pineDefaultA.glb', 'tree_pineSmallD.glb', 'tree_pineTallA.glb', 'tree_pineTallB.glb', 'tree_pineTallC.glb', 'tree_pineTallD.glb', 'tree_pineTallA_detailed.glb', 'tree_pineTallB_detailed.glb', 'tree_pineTallC_detailed.glb', 'tree_pineTallD_detailed.glb', 'tree_plateau_dark.glb', 'tree_simple_dark.glb', 'tree_small_dark.glb', 'tree_tall_dark.glb', 'tree_thin_dark.glb'];
    const flowerModels = ['flower_redA.glb', 'flower_purpleA.glb', 'flower_yellowA.glb'];
    const grassModels = ['grass_large.glb', 'grass.glb'];

    const environment = useMemo(() => {
        const items = [];
        const generateObjects = (models, count, scaleRange) => {
            let i = 0;
            while (i < count) {
                const x = (Math.random() - 0.5) * 80;
                const z = (Math.random() - 0.5) * 80;

                if (Math.abs(x) < 5) continue;
                if (Math.sqrt(x * x + z * z) < 8) continue;

                items.push({
                    id: `${models[0]}_${i}_${Math.random()}`,
                    fileName: models[Math.floor(Math.random() * models.length)],
                    position: [x, 0, z],
                    rotation: [0, Math.random() * Math.PI * 2, 0],
                    scale: scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]),
                });
                i++;
            }
        };

        generateObjects(treeModels, 120, [3.5, 6.5]);
        generateObjects(flowerModels, 40, [1.5, 2.5]);
        generateObjects(grassModels, 80, [2.0, 3.5]);

        return items;
    }, [treeModels]);

    const handleHitMonster = (points, id) => {
        setScore(scoreRef.current + points);
        if (points > 0) {
            setActiveMonsters(activeMonstersRef.current.filter(m => m.id !== id));
        }
    };

    const handleNextScene = () => {
        setPhase('transition_to_4');
    };

    const handleRestart = () => {
        setScore(0);
        setTimeLeft(120);
        setActiveMonsters([]);
        setSpawnCount(0);
        setPhase('playing');
    };

    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '15px', background: '#fff', color: '#000', border: '2px solid #000' };
    const thStyle = { border: '1px solid #000', padding: '12px', fontWeight: 'bold', background: '#e2e8f0', textAlign: 'center', fontSize: '16px' };
    const tdStyle = { border: '1px solid #000', padding: '10px', textAlign: 'center' };

    return (
        <group>
            <ambientLight intensity={1.2} />
            <directionalLight castShadow position={[10, 20, 10]} intensity={phase === 'victory' ? 3 : 1.5} color="#fef08a" />

            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <mesh receiveShadow>
                    <boxGeometry args={[150, 1, 150]} />
                    <meshStandardMaterial color={phase === 'victory' ? "#4ade80" : "#1b3b22"} />
                </mesh>
            </RigidBody>

            {environment.map((item) => (
                <DynamicModel key={item.id} fileName={item.fileName} position={item.position} rotation={item.rotation} scale={item.scale} />
            ))}

            {phase !== 'victory' && phase !== 'transition_to_4' && (
                <group position={[10, 0, 0]}>
                    <DynamicModel fileName="tent_detailedOpen.glb" position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]} scale={3.5} />
                </group>
            )}

            <Html center position={[0, 4, -5]} zIndexRange={[100, 0]}>
                <div style={{ width: '850px', pointerEvents: 'auto', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {phase === 'intro' && (
                        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '15px', color: 'white', textAlign: 'center', border: '2px solid #ef4444', width: '100%' }}>
                            <h2 style={{ color: '#f87171' }}>👺 Lord of the jungle:</h2>
                            <p>"(Yawn)... Who dares to wake up the lord of the forest? Those who want to succeed must follow my RULES! Rise up, my servants!"</p>
                            <button onClick={() => setPhase('lesson')} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                                Weapons here!
                            </button>
                        </div>
                    )}

                    {phase === 'lesson' && (
                        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '10px', color: '#000', width: '100%', maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ color: '#dc2626', margin: '0 0 15px 0', textAlign: 'center' }}>The comparison between the Present Perfect and Past Simple:</h2>

                            <h3 style={{ margin: '10px 0 5px 0' }}>Similarities</h3>
                            <p style={{ margin: '0 0 20px 20px', fontWeight: 'bold', fontSize: '16px' }}>Both are used to talk about events or actions that happened in the past.</p>

                            <h3 style={{ margin: '10px 0 10px 0' }}>Differences</h3>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Feature</th>
                                        <th style={thStyle}>Present Perfect</th>
                                        <th style={thStyle}>Past Simple</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Connection to Present</td>
                                        <td style={tdStyle}>Connects to the present (the result still relevant now).</td>
                                        <td style={tdStyle}>Finished action in the past, no connection to now.</td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Time</td>
                                        <td style={tdStyle}>No specific time. Or started in the past and still continues.</td>
                                        <td style={tdStyle}>Specific, clear time in the past.</td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Common Words</td>
                                        <td style={tdStyle}>never, ever, for, since, yet, already</td>
                                        <td style={tdStyle}>yesterday, last year, ago, when, in+ year</td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Example</td>
                                        <td style={tdStyle}>I have lost my phone. (I don't have it now).</td>
                                        <td style={tdStyle}>I lost my phone yesterday. (I have a new phone now).</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h2 style={{ color: '#2563eb', margin: '30px 0 15px 0', textAlign: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '20px' }}>Tense Summary</h2>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Tense</th>
                                        <th style={thStyle}>Use (Keyword)</th>
                                        <th style={thStyle}>Structure</th>
                                        <th style={thStyle}>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Present Simple</td>
                                        <td style={tdStyle}>Habits, facts</td>
                                        <td style={tdStyle}>V(s/es)</td>
                                        <td style={tdStyle}><i>She <b>studies</b> English every day.</i></td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Present Continuous</td>
                                        <td style={tdStyle}>Happening right now</td>
                                        <td style={tdStyle}>am/is/are + V-ing</td>
                                        <td style={tdStyle}><i>She <b>is studying</b> English right now.</i></td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Present Perfect</td>
                                        <td style={tdStyle}>Past connected to now</td>
                                        <td style={tdStyle}>have/has + V3/ed</td>
                                        <td style={tdStyle}><i>She <b>has studied</b> English for 3 years.</i></td>
                                    </tr>
                                    <tr>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Past Simple</td>
                                        <td style={tdStyle}>Finished action, specific time</td>
                                        <td style={tdStyle}>V2/ed</td>
                                        <td style={tdStyle}><i>She <b>studied</b> English last night.</i></td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3 style={{ color: '#ef4444', textAlign: 'center', marginTop: '30px' }}>System: click (or tap) on the monsters with WRONG GRAMMAR SENTENCES!</h3>
                            <button onClick={() => setPhase('playing')} style={{ marginTop: '15px', padding: '15px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.4)' }}>
                                START (2 Minutes)
                            </button>
                        </div>
                    )}

                    {phase === 'playing' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '-250px' }}>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', textShadow: '2px 2px 0 #000' }}>
                                TEAM SCORE: <span style={{ color: score < 0 ? '#ef4444' : '#4ade80' }}>{score}</span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: timeLeft <= 10 ? '#ef4444' : 'white', textShadow: '2px 2px 0 #000' }}>
                                TIME: <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    )}

                    {phase === 'gameover' && (
                        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center', border: '2px solid #ef4444', width: '100%', marginTop: '-200px' }}>
                            <h2 style={{ color: '#ef4444', fontSize: '30px' }}>☠️ GAME OVER</h2>
                            <p style={{ fontSize: '18px' }}>Time's up! You haven't defeated all the monsters.</p>
                            <button onClick={handleRestart} style={{ marginTop: '20px', padding: '15px 30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>TRY AGAIN TOGETHER</button>
                        </div>
                    )}

                    {phase === 'victory' && (
                        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center', border: '2px solid #4ade80', width: '100%', marginTop: '-200px' }}>
                            <h2 style={{ color: '#4ade80', fontSize: '30px', margin: '0 0 10px 0' }}>🎉 TEAM VICTORY!</h2>
                            <p style={{ fontSize: '24px', margin: '15px 0' }}>Total Score: <b style={{ color: '#fbbf24' }}>{score}</b></p>
                            <p style={{ fontSize: '16px', color: '#9ca3af', marginTop: '20px' }}>Step through the rainbow bridge to proceed to the next challenge.</p>
                        </div>
                    )}
                </div>
            </Html>

            {phase === 'playing' && activeMonsters.map(monster => (
                <Monster key={monster.id} data={monster} onHit={(pts) => handleHitMonster(pts, monster.id)} />
            ))}

            {phase === 'victory' && (
                <group position={[0, 0, -25]}>
                    <mesh position={[0, 4, 0]}>
                        <torusGeometry args={[10, 0.4, 16, 100, Math.PI]} />
                        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0, 4, -0.5]}>
                        <torusGeometry args={[9.2, 0.4, 16, 100, Math.PI]} />
                        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0, 4, -1]}>
                        <torusGeometry args={[8.4, 0.4, 16, 100, Math.PI]} />
                        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} />
                    </mesh>

                    <RigidBody type="fixed" colliders={false} position={[0, 1.5, 0]}>
                        <CuboidCollider args={[3, 4, 2]} sensor onIntersectionEnter={handleNextScene} />
                        <mesh>
                            <torusGeometry args={[3, 0.4, 16, 100]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
                        </mesh>
                    </RigidBody>
                </group>
            )}

            {phase === 'transition_to_4' && (
                <Html position={[0, 4, -25]} center zIndexRange={[99999, 0]}>
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '100vw', height: '100vh', backgroundColor: '#000',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        pointerEvents: 'auto'
                    }}>
                        <img
                            src="/mindmap grammar _2.jpg" alt="Mindmap"
                            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '10px' }}
                        />
                        <p style={{ color: '#fff', marginTop: '20px', fontSize: '24px', fontWeight: 'bold', animation: 'blink 1.5s infinite' }}>
                            [ PRESS ENTER TO CONTINUE ]
                        </p>
                        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                    </div>
                </Html>
            )}
        </group>
    )
}