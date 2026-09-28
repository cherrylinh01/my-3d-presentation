import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { myPlayer, usePlayersList } from 'playroomkit'
import { useControls } from '../../hooks/useControls'
import * as THREE from 'three'
import { useGLTF, useAnimations, Text } from '@react-three/drei' // Đã thêm Text

function AnimatedPlayerModel({ scale, action, modelPath = '/models/maincharacter.glb' }) {
    const group = useRef();
    const { scene, animations } = useGLTF(modelPath, true);
    const { actions } = useAnimations(animations, group);
    const [currentAction, setCurrentAction] = useState('Idle');

    useEffect(() => {
        if (!actions[action]) return;
        if (currentAction !== action) {
            const current = actions[currentAction];
            const next = actions[action];
            next.reset().fadeIn(0.2).play();
            if (current) current.fadeOut(0.2);
            setCurrentAction(action);
        }
    }, [action, currentAction, actions]);

    return (
        <group ref={group}>
            <primitive object={scene} scale={scale} position={[0, 0, 0]} />
        </group>
    );
}

function OtherPlayer({ player }) {
    const group = useRef();
    const [action, setAction] = useState(player.getState('action') || 'Idle');

    // Lấy thông tin Tên và Màu của người chơi từ Playroom
    const profile = player.getProfile();
    const playerName = profile?.name || "Khách";
    const playerColor = profile?.color?.hex || "#fbbf24";

    useEffect(() => {
        player.onSetState('action', (newAction) => {
            if (newAction) setAction(newAction);
        });
    }, [player]);

    useFrame(() => {
        if (!group.current) return;
        const pos = player.getState('pos');
        const rot = player.getState('rot');

        if (pos) {
            group.current.position.lerp(new THREE.Vector3(pos.x, pos.y, pos.z), 0.2);
        }
        if (rot) {
            group.current.rotation.y = rot[1];
        }
    });

    return (
        <group ref={group}>
            {/* HIỂN THỊ TÊN NGƯỜI CHƠI PHỤ */}
            <Text position={[0, 2.3, 0]} fontSize={0.25} color={playerColor} outlineWidth={0.02} outlineColor="#000" anchorY="bottom">
                {playerName}
            </Text>
            <AnimatedPlayerModel scale={1.1} action={action} modelPath="/models/subcharacter.glb" />
        </group>
    )
}

function OtherPlayers() {
    const players = usePlayersList(true);
    const me = myPlayer();
    return players.map((p) => {
        if (p.id === me.id) return null;
        return <OtherPlayer key={p.id} player={p} />
    });
}

export default function Player() {
    const bodyRef = useRef();
    const playerGroupRef = useRef();
    const me = myPlayer();
    const { forward, backward, left, right, jump, wave } = useControls();
    const speed = 7;

    const [action, setAction] = useState('Idle');
    const [waveLock, setWaveLock] = useState(false);

    // ==========================================
    // LẮNG NGHE SỰ KIỆN DỊCH CHUYỂN TỪ SCENE KHÁC
    // ==========================================
    useEffect(() => {
        const handleTeleport = (e) => {
            if (bodyRef.current) {
                // Di chuyển nhân vật và xóa gia tốc rơi
                bodyRef.current.setTranslation(e.detail, true);
                bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            }
        };
        window.addEventListener('teleportPlayer', handleTeleport);
        return () => window.removeEventListener('teleportPlayer', handleTeleport);
    }, []);

    useEffect(() => {
        me.setState('action', action);
    }, [action, me]);

    useFrame((state) => {
        if (!bodyRef.current || !playerGroupRef.current) return;

        const pos = bodyRef.current.translation();
        const linvel = bodyRef.current.linvel();

        // Nới lỏng kiểm tra chạm đất (0.2 thay vì 0.05) vì khi chạy qua chỗ gồ ghề sẽ có sai số vật lý nhỏ
        const isGrounded = Math.abs(linvel.y) < 0.2;

        if (pos.y < -15) {
            bodyRef.current.setTranslation({ x: 0, y: 5, z: 5 }, true);
            bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            return;
        }

        if (wave && !waveLock) {
            setWaveLock(true);
            setTimeout(() => setWaveLock(false), 2500);
        }

        // Tính toán hướng di chuyển từ bàn phím
        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
        const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed);

        // TÁCH BIỆT TRỤC XZ VÀ TRỤC Y
        const currentVelXZ = new THREE.Vector3(linvel.x, 0, linvel.z);
        const targetVelXZ = new THREE.Vector3(direction.x, 0, direction.z);

        // Làm mượt hướng đi (Lerp). Số 0.2 giúp khi đổi phím sẽ cua vòng thay vì bẻ gập khựng lại
        currentVelXZ.lerp(targetVelXZ, 0.2);

        // Xử lý nhảy độc lập, không bị khóa khi đang chạy
        let targetVelocityY = linvel.y;
        if (jump && isGrounded) {
            targetVelocityY = 6.0; // Lực nhảy
        }

        // Cập nhật vận tốc cuối cùng
        bodyRef.current.setLinvel({ x: currentVelXZ.x, y: targetVelocityY, z: currentVelXZ.z }, true);

        // Xoay mặt nhân vật
        if (targetVelXZ.length() > 0.1) {
            playerGroupRef.current.rotation.y = Math.atan2(currentVelXZ.x, currentVelXZ.z);
        }

        // Animation logic
        if (waveLock) {
            setAction('Waving');
        } else if (!isGrounded) {
            // Chỉ cần rời khỏi mặt đất là sẽ giữ nguyên dáng Jumping (cả lúc bay lên và rơi xuống)
            setAction('Jumping');
        } else if (targetVelXZ.length() > 0.1) {
            setAction('Jogging');
        } else {
            setAction('Idle');
        }

        // Nâng Y từ +4 lên +6 (cao hơn), Z từ +8 lên +10 (xa hơn)
        state.camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 6, pos.z + 10), 0.1);

        // Nâng điểm nhìn Y từ +2 lên +3.5 để camera ngước lên nhìn rõ các vật thể trên cao
        state.camera.lookAt(pos.x, pos.y + 3.5, pos.z);

        me.setState('pos', pos);
        me.setState('rot', [0, playerGroupRef.current.rotation.y, 0]);
    });

    return (
        <>
            <OtherPlayers />
            <RigidBody ref={bodyRef} colliders={false} position={[0, 5, 5]} mass={1} lockRotations>
                <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
                <group ref={playerGroupRef} position={[0, 0, 0]}>
                    <AnimatedPlayerModel scale={1.8} action={action} modelPath="/models/maincharacter.glb" />
                </group>
            </RigidBody>
        </>
    )
}