// src/components/ui/SlideOverlay.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function SlideOverlay() {
    // Đổi thành false để không bị che màn hình lúc mới Launch game
    const [showSlide, setShowSlide] = useState(false);

    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <AnimatePresence>
                {showSlide && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', bounce: 0.4 }}
                        className="pointer-events-auto w-[80%] max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl text-white font-poppins"
                    >
                        <h2 className="text-3xl font-bold mb-4 font-press-start text-yellow-400">
                            What is Success?
                        </h2>
                        <ul className="space-y-3 text-lg">
                            <li>✨ Not a destination, but a journey.</li>
                            <li>✨ Others' success may not apply to you.</li>
                        </ul>
                        <button
                            onClick={() => setShowSlide(false)}
                            className="mt-6 px-6 py-2 bg-blue-500/80 hover:bg-blue-400 rounded-full font-bold transition-colors"
                        >
                            Continue Journey
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}