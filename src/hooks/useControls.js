// src/hooks/useControls.js
import { useState, useEffect } from 'react'

export function useControls() {
    const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false, jump: false, wave: false })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') setKeys(k => ({ ...k, forward: true }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys(k => ({ ...k, backward: true }))
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(k => ({ ...k, left: true }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(k => ({ ...k, right: true }))
            if (e.code === 'Space') setKeys(k => ({ ...k, jump: true }))
            if (e.code === 'KeyF') setKeys(k => ({ ...k, wave: true })) // Thêm phím F để vẫy tay
        }
        const handleKeyUp = (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') setKeys(k => ({ ...k, forward: false }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys(k => ({ ...k, backward: false }))
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(k => ({ ...k, left: false }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(k => ({ ...k, right: false }))
            if (e.code === 'Space') setKeys(k => ({ ...k, jump: false }))
            if (e.code === 'KeyF') setKeys(k => ({ ...k, wave: false })) // Nhả phím F
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return keys
}