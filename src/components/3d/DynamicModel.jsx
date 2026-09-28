import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function DynamicModel({ fileName, position, rotation, scale = 1 }) {
    const { scene } = useGLTF(`/models/${fileName}`);
    return <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />;
}