// Reusable neon-styled button component

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/40 hover:text-cyan-100 shadow-cyan-500/30',
  secondary:
    'bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-purple-500/40 hover:text-purple-100 shadow-purple-500/30',
  danger:
    'bg-red-500/20 border-red-400 text-red-300 hover:bg-red-500/40 hover:text-red-100 shadow-red-500/30',
  ghost:
    'bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white/90 shadow-white/10',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      className={`
        relative border font-semibold tracking-wide
        transition-all duration-200 shadow-lg
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Glow overlay */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: 'inset 0 0 12px rgba(255,255,255,0.08)' }}
      />
      {children}
    </motion.button>
  );
}
