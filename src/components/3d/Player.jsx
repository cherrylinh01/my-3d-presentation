import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { myPlayer, usePlayersList, usePlayerState } from 'playroomkit'
import { useControls } from '../../hooks/useControls'
import * as THREE from 'three'
import { useGLTF, useAnimations, Text } from '@react-three/drei'

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
    const [action] = usePlayerState(player, 'action', 'Idle');
    const profile = player.getProfile();
    const playerName = profile?.name || "Khách";
    const playerColor = profile?.color?.hex || "#fbbf24";

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

    const cameraAngle = useRef(0);
    const cameraPitch = useRef(0.25); // Góc xoay dọc (lên/xuống)
    const groundedTime = useRef(0); // Biến hỗ trợ fix lỗi khựng nhảy
    // ==========================================
    // CAMERA: XỬ LÝ LƯỚT TOUCHPAD & KÉO CHUỘT
    // ==========================================
    useEffect(() => {
        const handleWheel = (e) => {
            if (Math.abs(e.deltaX) > 0) cameraAngle.current += e.deltaX * 0.005;
            if (Math.abs(e.deltaY) > 0) cameraPitch.current -= e.deltaY * 0.005; // Lướt dọc Touchpad

            // Khóa góc quay dọc: -0.5 (nhìn từ dưới lên), 1.2 (nhìn từ trên xuống)
            cameraPitch.current = Math.max(-0.5, Math.min(1.2, cameraPitch.current));
        };

        const handleMouseMove = (e) => {
            if (e.buttons > 0) {
                cameraAngle.current -= e.movementX * 0.005;
                cameraPitch.current -= e.movementY * 0.005; // Kéo dọc bằng Chuột

                cameraPitch.current = Math.max(-0.5, Math.min(1.2, cameraPitch.current));
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    // ==========================================
    // LẮNG NGHE SỰ KIỆN DỊCH CHUYỂN TỪ SCENE KHÁC
    // ==========================================
    useEffect(() => {
        const handleTeleport = (e) => {
            if (bodyRef.current) {
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

    useFrame((state, delta) => {
        if (!bodyRef.current || !playerGroupRef.current) return;

        const pos = bodyRef.current.translation();
        const linvel = bodyRef.current.linvel();

        // CHỐT CHẶN: Tránh lỗi tọa độ NaN
        if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) return;

        // ==========================================
        // FIX LỖI KHỰNG HOẠT ẢNH NHẢY
        // ==========================================
        if (Math.abs(linvel.y) < 0.1) {
            groundedTime.current += delta;
        } else {
            groundedTime.current = 0;
        }
        const isGrounded = groundedTime.current > 0.05;

        // Xử lý rớt vực
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
        direction.subVectors(frontVector, sideVector);

        // FIX LỖI CRASH NaN: Chỉ chuẩn hóa (normalize) nếu vector lớn hơn 0
        if (direction.lengthSq() > 0) {
            direction.normalize().multiplyScalar(speed);
        }

        // TÁCH BIỆT TRỤC XZ VÀ TRỤC Y
        const currentVelXZ = new THREE.Vector3(linvel.x, 0, linvel.z);
        const targetVelXZ = new THREE.Vector3(direction.x, 0, direction.z);

        currentVelXZ.lerp(targetVelXZ, 0.2);

        let targetVelocityY = linvel.y;
        if (jump && isGrounded) {
            targetVelocityY = 6.0;
            groundedTime.current = 0;
        }

        bodyRef.current.setLinvel({ x: currentVelXZ.x, y: targetVelocityY, z: currentVelXZ.z }, true);

        // Xoay mặt nhân vật theo hướng di chuyển
        if (targetVelXZ.length() > 0.1) {
            playerGroupRef.current.rotation.y = Math.atan2(currentVelXZ.x, currentVelXZ.z);
        }

        // Cập nhật Animation
        if (waveLock) {
            setAction('Waving');
        } else if (!isGrounded) {
            setAction('Jumping');
        } else if (targetVelXZ.length() > 0.1) {
            setAction('Jogging');
        } else {
            setAction('Idle');
        }

        // --- CẬP NHẬT CAMERA ĐỘNG ---
        const radius = 10;
        const targetY = pos.y + 3.5; // Tâm điểm xoay là đầu nhân vật

        // Tọa độ cầu: Kết hợp cả sin/cos của góc ngang (Angle) và góc dọc (Pitch)
        const camX = pos.x + radius * Math.sin(cameraAngle.current) * Math.cos(cameraPitch.current);
        const camY = targetY + radius * Math.sin(cameraPitch.current);
        const camZ = pos.z + radius * Math.cos(cameraAngle.current) * Math.cos(cameraPitch.current);

        // Camera bay mượt đến tọa độ 3D mới
        state.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);

        // Luôn luôn nhìn thẳng vào tâm điểm (đầu nhân vật)
        state.camera.lookAt(pos.x, targetY, pos.z);
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
useGLTF.preload('/models/maincharacter.glb');
useGLTF.preload('/models/subcharacter.glb');