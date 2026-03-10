// Glassmorphism modal overlay

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, children, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className={`
              relative z-10 rounded-2xl border border-white/10
              bg-gradient-to-br from-slate-900/90 to-slate-800/90
              backdrop-blur-xl shadow-2xl
              ${className}
            `}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
